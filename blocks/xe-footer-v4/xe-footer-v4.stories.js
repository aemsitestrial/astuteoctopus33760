/*
 * Storybook stories for the XE Footer V4 block (@ignite/web footer composition).
 *
 * The model (blocks/xe-footer-v4/_xe-footer-v4.json) renders four rows, in
 * order, empty or not: social, legal, columns, banner (the logo and the
 * copyright, with the current year, are static). Each link
 * column is a heading + a page path (column_headingN + column_linksN, an
 * aem-content link); the decorator lists the path's child pages from the
 * query index.
 *
 * The query index is mocked: requests for /query-index.json return INDEX
 * below (paged like the real sheet), so the stories exercise the population
 * logic without a published site.
 */
import { expect, waitFor } from 'storybook/test';
import decorate from './xe-footer-v4.js';
import { renderBlock, picture } from '../../.storybook/eds.js';
import { copyrightText } from '../../scripts/components/xe-footer-utils.js';

// The static copyright, with the current year.
const COPYRIGHT = copyrightText();

// The mocked query index: published pages, some with a title, some without.
const INDEX = [
  { path: '/', title: 'Home', robots: '' },
  { path: '/company', title: 'Company', robots: '' },
  { path: '/company/community', title: 'Community', robots: '' },
  { path: '/company/careers', title: 'Careers', robots: '' },
  { path: '/company/careers/open-roles', title: 'Open Roles', robots: '' }, // grandchild: not listed
  { path: '/company/newsroom', title: 'Newsroom', robots: 'noindex' }, // noindex: not listed
  { path: '/energy', title: 'Energy & Environment', robots: '' },
  { path: '/energy/sustainability', title: 'Sustainability', robots: '' },
  { path: '/energy/net-zero-plan', robots: '' }, // no title: labelled from its URL
  { path: '/energy/energy-portfolio', title: 'Energy Portfolio', robots: '' },
  { path: '/partners', title: 'Partner Resources', robots: '' }, // no child pages
];

/** Serves /query-index.json from INDEX (with offset / limit paging). */
function mockQueryIndex() {
  if (window.fetch.queryIndexMock) return;
  const realFetch = window.fetch.bind(window);
  const mock = (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (url.pathname !== '/query-index.json') return realFetch(input, init);
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || 1000);
    const body = {
      total: INDEX.length, offset, limit, data: INDEX.slice(offset, offset + limit), ':type': 'sheet',
    };
    return Promise.resolve(new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } }));
  };
  mock.queryIndexMock = true;
  window.fetch = mock;
}

/** A heading + page path pair as AEM renders it (the aem-content link shows its path). */
const column = (heading, path) => (heading && path ? `<p>${heading}</p><p><a href="${path}">${path}</a></p>` : '');

const defaults = {
  columns: [
    column('Company', '/company'),
    // In the Universal Editor, links use AEM content paths.
    column('Energy &amp; Environment', '/content/2026/38/astuteoctopus33760/energy.html'),
    column('Partner Resources', '/partners'),
  ].join(''),
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
};

/** The four rows AEM renders for the model (blank groups are empty cells). */
function fieldsToRows(args) {
  const banner = [
    args.banner_background ? picture(args.banner_background, '') : '',
    args.banner_tagline ? `<p>${args.banner_tagline}</p>` : '',
  ].join('');
  return [
    [''], // social: none authored, so the defaults render
    [''], // legal: none authored, so the defaults render
    [args.columns || ''],
    [banner],
  ];
}

const argTypes = {
  columns: { control: 'text', description: 'Column N Heading + Column N Parent Page pairs (<p>heading</p><p><a href="path">…</a></p>); each column lists the page\'s child pages.', table: { category: 'Link Columns' } },
  banner_background: { control: 'text', description: 'Banner Image (reference) — asset URL for the full-width background image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Banner Tagline (text) — centered over the banner image.', table: { category: 'Banner' } },
};

export default {
  title: 'Blocks/XE Footer V4',
  argTypes,
  args: defaults,
  render: (args) => {
    mockQueryIndex();
    return renderBlock({ name: 'xe-footer-v4', rows: fieldsToRows(args), decorate });
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Xcel footer rendered with the @ignite/web footer composition. Each '
          + 'link column lists the child pages of a configured path, from the '
          + 'query index (mocked here).',
      },
    },
  },
};

/** Waits for the footer's columns to render. */
async function upgraded(canvasElement) {
  await waitFor(() => expect(canvasElement.querySelector('xe-footer')?.shadowRoot?.querySelector('footer')).toBeTruthy(), { timeout: 8000 });
  return canvasElement.querySelector('xe-footer');
}

/** Each column as { heading, links: [[text, href]] }, once rendered. */
const columns = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer > xe-footer-column')]
  .map((col) => ({
    heading: col.getAttribute('heading'),
    links: [...col.querySelectorAll('xe-hyperlink')].map((link) => [link.textContent, link.getAttribute('href')]),
  }));

// Each column lists its path's published child pages, sorted by title.
export const Default = {
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll('xe-footer > xe-footer-column')).toHaveLength(3));
    await expect(footer).toHaveAttribute('columns', '3');
    // The copyright is static, with the current year.
    await expect(canvasElement.querySelector('xe-footer > span[slot="copyright"]')).toHaveTextContent(COPYRIGHT);
    await expect(columns(canvasElement)).toEqual([
      // Direct children only (not /company/careers/open-roles), and not noindex pages.
      { heading: 'Company', links: [['Careers', '/company/careers'], ['Community', '/company/community']] },
      // An AEM content path resolves to the site path; a page without a title
      // is labelled from its URL.
      {
        heading: 'Energy & Environment',
        links: [
          ['Energy Portfolio', '/energy/energy-portfolio'],
          ['Net Zero Plan', '/energy/net-zero-plan'],
          ['Sustainability', '/energy/sustainability'],
        ],
      },
      // No child pages: a single link to the path itself, with its title.
      { heading: 'Partner Resources', links: [['Partner Resources', '/partners']] },
    ]);
  },
};

// No paths configured: no columns (and the query index isn't needed).
export const NoColumns = {
  args: { columns: '' },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).not.toHaveAttribute('columns');
    await expect(canvasElement.querySelectorAll('xe-footer-column')).toHaveLength(0);
  },
};

// A heading without a path yet renders no column; the others are unaffected.
export const HeadingWithoutPath = {
  args: { columns: `${column('Company', '/company')}<p>Investors</p>` },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll('xe-footer > xe-footer-column')).toHaveLength(1));
    await expect(columns(canvasElement).map(({ heading }) => heading)).toEqual(['Company']);
  },
};

// Published before the copyright became static: the old copyright row comes
// first. It's skipped — the columns and banner still land in place and the
// static copyright, with the current year, renders.
export const LegacyCopyrightRow = {
  render: (args) => {
    mockQueryIndex();
    return renderBlock({
      name: 'xe-footer-v4',
      rows: [['<p>© 2024 Xcel Energy Inc. All rights reserved.</p>'], ...fieldsToRows(args)],
      decorate,
    });
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toHaveTextContent(COPYRIGHT);
    await waitFor(() => expect(footer).toHaveAttribute('columns', '3'));
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
  },
};
