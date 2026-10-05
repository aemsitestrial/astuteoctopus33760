/*
 * Storybook stories for the XE Footer V2 block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer-v2/
 * _xe-footer-v2.json) one-to-one, so editing a control here is the same as
 * editing that field in the Universal Editor:
 *
 *   copyright               text              -> "copyright" (plain text)
 *   banner_background       reference         -> "banner_background" (asset URL)
 *   banner_tagline          text              -> "banner_tagline" (grouped with the background)
 *
 * Child items (the block's filter), each in its own row:
 *
 *   xe-footer-column-links  heading + page (aem-content), grouped into one cell
 *                             -> "linkColumns" (heading + page path pairs, one item each)
 *   xe-footer-social-links  network select + profile URL -> "socialLinks" (links, one item each)
 *   xe-footer-legal-links   links (rich-text list)       -> "legalLinks" (one item, the whole list)
 *
 * `fieldsToRows` renders the container markup AEM produces: one single-cell
 * row per field (copyright, banner), empty or not, followed by one row per
 * child item. The logo isn't authorable: it's the static Ignite logo.
 * Other stories cover footers created while the block was key-value
 * (`name | value` rows, with link columns), link column items authored as a
 * rich-text link list, and the original positional layout.
 *
 * Each link column lists its page's child pages from the query index, which
 * is mocked: requests for /query-index.json return INDEX below.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer-v2.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

/** A <ul> of [text, href] links (rich-text lists, and the link sets split into items). */
const linkList = (pairs) => `<ul>${pairs.map(([text, href]) => `<li><a href="${href}">${text}</a></li>`).join('')}</ul>`;
const list = (labels) => linkList(labels.map((label) => [label, '#']));

// The authored logo of footers created before the logo became static.
const LEGACY_LOGO = '/icons/xcel-logo-white.svg';

// Link columns as rich-text lists: key-value footers' column slots, the
// original layout's footer links, and items authored before Page.
const COLUMNS = [
  ['Company', ['About us', 'Careers', 'Newsroom', 'Sustainability']],
  ['Services', ['Residential', 'Business', 'Renewable plans', 'Usage insights']],
  ['Support', ['Contact us', 'Help center', 'Report an outage', 'Billing &amp; payments']],
];
const LIST_COLUMNS = COLUMNS.map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join('');

// The mocked query index: published pages, some with a title, some without.
const INDEX = [
  { path: '/', title: 'Home', robots: '' },
  { path: '/company', title: 'Company', robots: '' },
  { path: '/company/community', title: 'Community', robots: '' },
  { path: '/company/careers', title: 'Careers', robots: '' },
  { path: '/company/careers/open-roles', title: 'Open Roles', robots: '' }, // grandchild: not listed
  { path: '/company/newsroom', title: 'Newsroom', robots: 'noindex' }, // noindex: not listed
  { path: '/energy-environment', title: 'Energy & Environment', robots: '' },
  { path: '/energy-environment/sustainability', title: 'Sustainability', robots: '' },
  { path: '/energy-environment/net-zero-plan', robots: '' }, // no title: labelled from its URL
  { path: '/partner-resources', title: 'Partner Resources', robots: '' }, // no child pages
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

/** A link column item as AEM renders it: heading + the page link (its text is the content path). */
const pathColumn = (heading, path) => `${heading ? `<p>${heading}</p>` : ''}<p><a href="${path}">${path}</a></p>`;

const PATH_COLUMNS = [
  pathColumn('Company', '/company'),
  // In the Universal Editor, links use AEM content paths.
  pathColumn('Energy &amp; Environment', '/content/2026/38/astuteoctopus33760/energy-environment.html'),
  pathColumn('Partner Resources', '/partner-resources'),
].join('');

// The columns PATH_COLUMNS renders: each page's published child pages.
const EXPECTED_PATH_COLUMNS = [
  // Direct children only (not /company/careers/open-roles), and not noindex pages.
  { heading: 'Company', links: [['Careers', '/company/careers'], ['Community', '/company/community']] },
  // An AEM content path resolves to the site path; a page without a title is
  // labelled from its URL.
  {
    heading: 'Energy & Environment',
    links: [['Net Zero Plan', '/energy-environment/net-zero-plan'], ['Sustainability', '/energy-environment/sustainability']],
  },
  // No child pages: a single link to the page itself, with its title.
  { heading: 'Partner Resources', links: [['Partner Resources', '/partner-resources']] },
];

// xe-footer-social-links: the link text is the "Network" select value.
const SOCIAL_ITEMS = linkList([
  ['facebook', 'https://www.facebook.com/XcelEnergy'],
  ['x', 'https://twitter.com/XcelEnergy'],
  ['instagram', 'https://www.instagram.com/xcelenergy'],
  ['linkedin', 'https://www.linkedin.com/company/xcel-energy'],
  ['youtube', 'https://www.youtube.com/XcelEnergyVideo'],
]);
const LEGAL_ITEMS = list(['Privacy Policy', 'Terms of Use', 'Cookie Preferences']);

// Rich-text social / legal fields of older footers.
const SOCIAL_RICH_TEXT = [
  '<p>',
  '<a href="#" aria-label="Facebook">', picture('/icons/facebook.svg', 'Facebook'), '</a>',
  '<a href="#" aria-label="X">', picture('/icons/x.svg', 'X'), '</a>',
  '<a href="#" aria-label="Instagram">', picture('/icons/instagram.svg', 'Instagram'), '</a>',
  '<a href="#" aria-label="LinkedIn">', picture('/icons/linkedin.svg', 'LinkedIn'), '</a>',
  '<a href="#" aria-label="YouTube">', picture('/icons/youtube.svg', 'YouTube'), '</a>',
  '</p>',
].join('\n');

// --- Default field values (a realistic, fully-authored footer) --------------
const defaults = {
  copyright: '© 2026 Xcel Energy. All rights reserved.',
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
  linkColumns: PATH_COLUMNS,
  socialLinks: SOCIAL_ITEMS,
  legalLinks: LEGAL_ITEMS,
};

/**
 * One social item row per link in `html` (the socialLinks control): each
 * item's network + profile URL collapse into a single <a>.
 */
function itemRows(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('a')].map((anchor) => [`<p>${anchor.outerHTML}</p>`]);
}

/** How many item rows `html` renders as. */
const itemCount = (html) => itemRows(html).length;

/** The legal links item row: its one rich-text field holds the whole list. */
const legalRows = (html) => (html ? [[html]] : []);

/**
 * One link column item row per heading in `html` (the linkColumns control):
 * the item's heading + page are grouped into one cell,
 * <p>heading</p><p><a>…</a></p> (or <p>heading</p><ul>…</ul> for a rich-text list).
 */
function columnRows(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = [];
  [...doc.body.children].forEach((node) => {
    const isHeading = node.matches('p') && !node.querySelector('a');
    if (isHeading || !rows.length) rows.push([node.outerHTML]);
    else rows[rows.length - 1][0] += node.outerHTML;
  });
  return rows;
}

/**
 * The container markup: one single-cell row per field in model order, empty
 * or not — copyright, banner (background + tagline grouped) — then one row
 * per child item: each link column, each social link, and the legal links.
 */
function fieldsToRows(args) {
  const rows = [];
  rows.push([args.copyright ? `<p>${args.copyright}</p>` : '']);
  const background = args.banner_background ? picture(args.banner_background, '') : '';
  rows.push([`${background}${args.banner_tagline ? `<p>${args.banner_tagline}</p>` : ''}`]);
  rows.push(
    ...columnRows(args.linkColumns),
    ...itemRows(args.socialLinks),
    ...legalRows(args.legalLinks),
  );
  return rows;
}

/** Key-value rows of a footer created while the block was key-value (with column slots). */
function keyValueRows(args, columns = COLUMNS) {
  const rows = [['logo', picture(LEGACY_LOGO, '')], ['logoAlt', 'Xcel'], ['copyright', args.copyright]];
  columns.forEach(([heading, links], index) => {
    if (!links.length) return;
    rows.push([`column${index + 1}Heading`, heading], [`column${index + 1}Links`, list(links)]);
  });
  rows.push(['banner_background', picture(args.banner_background, '')], ['banner_tagline', args.banner_tagline]);
  rows.push(...itemRows(args.socialLinks), ...legalRows(args.legalLinks));
  return rows;
}

/** The original positional layout: logo, copyright, social, legal, footer links, banner. */
function legacyRows(args) {
  return [
    [picture(LEGACY_LOGO, 'Xcel')],
    [`<p>${args.copyright}</p>`],
    [SOCIAL_RICH_TEXT],
    [LEGAL_ITEMS],
    [LIST_COLUMNS],
    [`${picture(args.banner_background, 'Banner')}<p>${args.banner_tagline}</p>`],
  ];
}

const COLUMN = 'xe-footer-column-links';
const SOCIAL = 'xe-footer-social-links';
const LEGAL = 'xe-footer-legal-links';
const ITEM_LABELS = {
  [COLUMN]: 'XE Footer Link Column', [SOCIAL]: 'XE Footer Social Link', [LEGAL]: 'XE Footer Legal Links',
};

/** The item models of a footer's item rows, in order: link columns, social, legal. */
const itemModels = (columns, social, legal) => [
  ...Array(columns).fill(COLUMN), ...Array(social).fill(SOCIAL), ...Array(legal).fill(LEGAL),
];

/**
 * A decorate() that first instruments the block and the last `models.length`
 * rows (the child items) the way the Universal Editor serves them — the block
 * as a container with its filter; each item's resource, type, model and
 * label — so stories can check the instrumentation survives decoration, the
 * items stay in the editor's content tree, and the filter the (+) menu uses.
 */
const inEditor = (models) => (block) => {
  block.setAttribute('data-aue-resource', 'urn:aemconnection:/content/xcel/index/jcr:content/root/section/xe_footer_v2');
  block.setAttribute('data-aue-type', 'container');
  block.setAttribute('data-aue-filter', 'xe-footer-v2');
  const rows = [...block.children].slice(-models.length);
  rows.forEach((row, index) => {
    const model = models[index];
    row.setAttribute('data-aue-resource', `urn:aemconnection:/content/xcel/index/jcr:content/root/section/xe_footer_v2/item_${index}`);
    row.setAttribute('data-aue-type', 'component');
    row.setAttribute('data-aue-model', model);
    row.setAttribute('data-aue-label', ITEM_LABELS[model]);
  });
  return decorate(block);
};

const render = (rows, decorator = decorate) => {
  mockQueryIndex();
  return renderBlock({ name: 'xe-footer-v2', rows, decorate: decorator });
};

// argTypes drive the Controls panel — the Storybook analogue of the Universal
// Editor properties rail.
const argTypes = {
  copyright: { control: 'text', description: 'Copyright (plain text).', table: { category: 'Brand' } },
  banner_background: { control: 'text', description: 'Background (reference) — asset URL for the full-bleed banner image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Tagline — centered banner overlay text.', table: { category: 'Banner' } },
  linkColumns: { control: 'text', description: 'XE Footer Link Column items — one item per heading: <p>heading</p> followed by the page link (<p><a href="path">path</a></p>); the column lists the page\'s child pages.', table: { category: 'Child items' } },
  socialLinks: { control: 'text', description: 'XE Footer Social Link items — one item per link; the link text is the network (facebook, x, instagram, linkedin, youtube).', table: { category: 'Child items' } },
  legalLinks: { control: 'text', description: 'XE Footer Legal Links item — one rich-text bulleted list of links.', table: { category: 'Child items' } },
};

export default {
  title: 'Blocks/XE Footer V2',
  // A custom docs page lives in xe-footer-v2.mdx; don't also auto-generate one.
  argTypes,
  args: defaults,
  render: (args) => render(fieldsToRows(args)),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Xcel footer rendered with the @ignite/web footer composition: '
          + '<xe-footer> with the static logo and copyright, social icon buttons '
          + 'and legal links from its XE Footer Social Links / Legal Links child '
          + 'items, link columns (an accordion below 1024px), and a full-bleed '
          + 'banner with a centered tagline. Controls map one-to-one to the '
          + 'authoring model.',
      },
    },
  },
};

// --- Helpers for the play functions -----------------------------------------

/**
 * Waits for the Ignite footer to render its shadow DOM (it's added once the
 * link columns are built, after the query index loads).
 */
async function upgraded(canvasElement) {
  await waitFor(() => expect(canvasElement.querySelector('xe-footer')?.shadowRoot?.querySelector('footer')).toBeTruthy(), { timeout: 8000 });
  return canvasElement.querySelector('xe-footer');
}

/** Each column as { heading, links: [[text, href]] }. */
const columnsOf = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer > xe-footer-column')]
  .map((col) => ({
    heading: col.getAttribute('heading'),
    links: [...col.querySelectorAll('xe-hyperlink')].map((link) => [link.textContent, link.getAttribute('href')]),
  }));

/**
 * The static Ignite logo: inverse, medium, labelled, linking to the homepage
 * (the link renders in its shadow root).
 */
async function expectStaticLogo(canvasElement) {
  const logo = canvasElement.querySelector('xe-footer > xe-logo[slot="logo"]');
  await expect(logo).toHaveAttribute('variant', 'inverse');
  await expect(logo).toHaveAttribute('size', 'md');
  await expect(logo).toHaveAttribute('href', '/');
  await expect(logo).toHaveAttribute('label', 'Xcel Energy Home');
  await waitFor(() => expect(logo.shadowRoot?.querySelector('a')).toHaveAttribute('href', '/'));
  await expect(canvasElement.querySelector('[slot="logo"] img, picture[slot="logo"]')).toBeNull();
}

const columnHeadings = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer-column')]
  .map((col) => col.getAttribute('heading'));

/**
 * The rendered social icon buttons as [aria-label, href, icon] triples. The
 * button moves its aria-label onto the anchor in its shadow root, so wait for
 * that render.
 */
async function socialLinks(canvasElement) {
  const buttons = [...canvasElement.querySelectorAll('xe-footer > xe-icon-button[slot="social"]')];
  await waitFor(() => expect(buttons.every((b) => b.shadowRoot?.querySelector('a'))).toBe(true));
  return buttons.map((button) => [
    button.shadowRoot.querySelector('a').getAttribute('aria-label'),
    button.getAttribute('href'),
    button.querySelector('xe-icon').getAttribute('icon'),
  ]);
}

/** The rendered legal links (direct slotted hyperlinks) as [text, href] pairs. */
const legalLinks = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer > xe-hyperlink[slot="legal"]')]
  .map((link) => [link.textContent, link.getAttribute('href')]);

/** The instrumented element for child item `index` (see inEditor). */
const itemElement = (canvasElement, index) => canvasElement
  .querySelector(`[data-aue-resource$="/item_${index}"]`);

const EXPECTED_SOCIAL = [
  ['Facebook (opens in a new window)', 'https://www.facebook.com/XcelEnergy', 'faSquareFacebook'],
  ['X (opens in a new window)', 'https://twitter.com/XcelEnergy', 'faSquareXTwitter'],
  ['Instagram (opens in a new window)', 'https://www.instagram.com/xcelenergy', 'faInstagram'],
  ['LinkedIn (opens in a new window)', 'https://www.linkedin.com/company/xcel-energy', 'faSquareLinkedin'],
  ['YouTube (opens in a new window)', 'https://www.youtube.com/XcelEnergyVideo', 'faYoutube'],
];
const AUTHORED_LEGAL = [['Privacy Policy', '#'], ['Terms of Use', '#'], ['Cookie Preferences', '#']];

// --- Stories: the container model -------------------------------------------

// The footer as authored now: its fields plus link column, social and legal items.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    // One <xe-footer-column heading="…"> per link column item, listing its
    // page's child pages as direct <xe-hyperlink variant="variant"> children
    // the column wraps in <li>s.
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnsOf(canvasElement)).toEqual(EXPECTED_PATH_COLUMNS);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(2));
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('xe-footer > span[slot="copyright"]'))
      .toHaveTextContent('© 2026 Xcel Energy. All rights reserved.');
    await expect(canvas.getByText('© 2026 Xcel Energy. All rights reserved.')).toBeInTheDocument();
    // Social: one <xe-icon-button slot="social" size="xl"> per network, opening
    // in a new window. Legal: <xe-hyperlink slot="legal" trailing-icon>s.
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    const buttons = [...canvasElement.querySelectorAll('xe-icon-button[slot="social"]')];
    await expect(buttons.every((b) => b.getAttribute('size') === 'xl' && b.getAttribute('target') === '_blank')).toBe(true);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect([...canvasElement.querySelectorAll('xe-hyperlink[slot="legal"]')].every((l) => l.hasAttribute('trailing-icon'))).toBe(true);
    await expect(canvasElement.querySelector('xe-footer > img[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};

// No social or legal items — the live Xcel Energy footer's links render.
export const DefaultLinks = {
  args: { socialLinks: '', legalLinks: '' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual([
      ['Online Terms of Use', 'https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf'],
      ['Privacy', 'https://my.xcelenergy.com/s/privacy'],
      ['Accessibility', 'https://corporate.my.xcelenergy.com/s/about/accessibility'],
    ]);
  },
};

// The items in the other order (legal first): each is recognized by its links.
export const ItemsReversed = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push(...legalRows(args.legalLinks), ...itemRows(args.socialLinks));
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// Blank fields don't shift the rest: with no copyright (an empty first row)
// and no tagline, the banner image still lands as the banner.
export const BlankFields = {
  args: { copyright: '', banner_tagline: '' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toBeNull();
  },
};

// An older footer's rich-text copyright (here with a link) renders as its
// plain text — and isn't read as a legal links item.
export const RichTextCopyright = {
  render: (args) => render(keyValueRows({
    ...args, copyright: '<p>© 2026 Xcel Energy Inc. <a href="#">Legal notices</a></p>',
  })),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    const copyright = canvasElement.querySelector('span[slot="copyright"]');
    await expect(copyright).toHaveTextContent('© 2026 Xcel Energy Inc. Legal notices');
    await expect(copyright.querySelector('a')).toBeNull();
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// A published item that's only half filled in (network chosen, no URL yet)
// renders no link: it's skipped rather than read as another field, even with
// the copyright blank.
export const IncompleteItem = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, copyright: '' });
    rows.push(['<p>facebook</p>']);
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
  },
};

// A published link column item with a heading but no links yet renders
// nothing; the other columns are unaffected.
export const ColumnHeadingOnly = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push(['<p>Investors</p>'], ...itemRows(args.socialLinks), ...legalRows(args.legalLinks));
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Energy & Environment', 'Partner Resources']);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toHaveTextContent('© 2026 Xcel Energy');
  },
};

// A published link column item with a page but no heading yet renders an
// untitled column of the page's child pages — not a legal link.
export const ColumnPageOnly = {
  args: { linkColumns: pathColumn('', '/company') },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '1');
    await expect(columnsOf(canvasElement)).toEqual([
      { heading: null, links: [['Careers', '/company/careers'], ['Community', '/company/community']] },
    ]);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// Link column items authored while Links was a rich-text list render their
// links as authored.
export const ListColumnItems = {
  args: { linkColumns: LIST_COLUMNS },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(4));
  },
};

// The logo is static: Ignite's Xcel Energy logo, linking to the homepage.
export const StaticLogo = {
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expectStaticLogo(canvasElement);
  },
};

export const EditorItems = {
  render: (args) => render(
    fieldsToRows(args),
    inEditor(itemModels(
      columnRows(args.linkColumns).length,
      itemCount(args.socialLinks),
      legalRows(args.legalLinks).length,
    )),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // 3 link columns (item_0–2), 5 social items (item_3–7) and the legal links
    // item (item_8), each its own element.
    const elements = [...Array(9).keys()].map((index) => itemElement(canvasElement, index));
    await expect(elements.every(Boolean)).toBe(true);
    await expect(elements.slice(0, 3).every((el) => el.matches('xe-footer > xe-footer-column'))).toBe(true);
    await expect(elements.slice(3, 8).every((el) => el.matches('xe-footer > xe-icon-button[slot="social"]'))).toBe(true);
    await expect(elements.slice(8).every((el) => el.matches('xe-footer > xe-hyperlink[slot="legal"]'))).toBe(true);
    await expect(itemElement(canvasElement, 0)).toHaveAttribute('data-aue-model', 'xe-footer-column-links');
    await expect(itemElement(canvasElement, 0)).toHaveAttribute('heading', 'Company');
    const social = itemElement(canvasElement, 3);
    const legal = itemElement(canvasElement, 8);
    await expect(social.matches('xe-footer > xe-icon-button[slot="social"]')).toBe(true);
    await expect(social).toHaveAttribute('data-aue-model', 'xe-footer-social-links');
    await expect(social).toHaveAttribute('data-aue-type', 'component');
    await expect(legal.matches('xe-footer > xe-hyperlink[slot="legal"]')).toBe(true);
    await expect(legal).toHaveAttribute('data-aue-model', 'xe-footer-legal-links');
    // The block's own fields are still read with instrumented item rows present.
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('span[slot="copyright"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    // Five social links and one legal links item are the most the footer
    // shows, so the block switches to the filter without those items: (+)
    // only offers link columns.
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-social-legal-full');
  },
};

// Items just added (no links yet) render a placeholder carrying their
// instrumentation instead of disappearing — and don't fall back to defaults.
export const EditorEmptyItems = {
  render: (args) => {
    const rows = fieldsToRows({
      ...args, linkColumns: '', socialLinks: '', legalLinks: '',
    });
    rows.push([''], [''], ['']);
    return render(rows, inEditor(itemModels(1, 1, 1)));
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // The link column placeholder sits in the default slot (the columns grid).
    const column = itemElement(canvasElement, 0);
    await expect(column.matches('xe-footer > span.xe-footer-v2-placeholder:not([slot])')).toBe(true);
    await expect(column).toHaveTextContent('Add a link column');
    await expect(canvasElement.querySelectorAll('xe-footer-column')).toHaveLength(0);
    const social = itemElement(canvasElement, 1);
    const legal = itemElement(canvasElement, 2);
    await expect(social.matches('span.xe-footer-v2-placeholder[slot="social"]')).toBe(true);
    await expect(social).toHaveTextContent('Add a social link');
    await expect(legal.matches('span.xe-footer-v2-placeholder[slot="legal"]')).toBe(true);
    await expect(legal).toHaveTextContent('Add legal links');
    await expect(canvasElement.querySelectorAll('xe-icon-button')).toHaveLength(0);
    await expect(legalLinks(canvasElement)).toEqual([]);
    // One link column and one social link item are below their limits; the
    // legal links item, even empty, is the one the footer shows.
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-legal-full');
  },
};

// Below every limit, the block keeps its own filter.
export const EditorBelowLimits = {
  args: { legalLinks: '' },
  render: (args) => render(
    fieldsToRows({ ...args, socialLinks: linkList([['facebook', 'https://www.facebook.com/XcelEnergy']]) }),
    inEditor(itemModels(columnRows(args.linkColumns).length, 1, 0)),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2');
  },
};

// The item's model decides where it renders, even when its links would look
// like the other list (a legal page on facebook.com).
export const EditorModelWins = {
  render: (args) => render(
    fieldsToRows({ ...args, legalLinks: linkList([['Facebook terms', 'https://www.facebook.com/terms']]) }),
    inEditor(itemModels(columnRows(args.linkColumns).length, itemCount(args.socialLinks), 1)),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(legalLinks(canvasElement)).toEqual([['Facebook terms', 'https://www.facebook.com/terms']]);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
  },
};

// Seven social link items: two more than the footer shows.
const SEVEN_SOCIAL_ITEMS = SOCIAL_ITEMS.replace('</ul>', linkList([
  ['facebook', 'https://www.facebook.com/XcelEnergyColorado'],
  ['youtube', 'https://www.youtube.com/XcelEnergyCareers'],
]).replace('<ul>', ''));

// Published: only the first five social link items render.
export const TooManySocialLinks = {
  args: { socialLinks: SEVEN_SOCIAL_ITEMS },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(canvasElement.querySelector('.xe-footer-v2-placeholder')).toBeNull();
  },
};

// In the editor, the 6th and 7th social link items show a notice (still
// selectable, so the author can remove them) instead of rendering.
export const EditorTooManySocialLinks = {
  args: { socialLinks: SEVEN_SOCIAL_ITEMS, legalLinks: '' },
  render: (args) => render(
    fieldsToRows(args),
    inEditor(itemModels(
      columnRows(args.linkColumns).length,
      itemCount(args.socialLinks),
      legalRows(args.legalLinks).length,
    )),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // Link columns are item_0–2; social link items item_3–9.
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    [8, 9].forEach((index) => {
      const notice = itemElement(canvasElement, index);
      expect(notice.matches('span.xe-footer-v2-placeholder[slot="social"]')).toBe(true);
      expect(notice).toHaveTextContent('Only 5 social links are shown — remove this one');
      expect(notice).toHaveAttribute('data-aue-model', 'xe-footer-social-links');
    });
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-social-full');
  },
};

// Seven link column items: two more than the footer shows.
const SEVEN_COLUMNS = PATH_COLUMNS + [
  pathColumn('Outages &amp; Safety', '/outages-safety'),
  pathColumn('Customer Support', '/customer-support'),
  pathColumn('Investors', '/investors'),
  pathColumn('Newsroom', '/newsroom'),
].join('');
const FIRST_FIVE_HEADINGS = [
  'Company', 'Energy & Environment', 'Partner Resources', 'Outages & Safety', 'Customer Support',
];

// Published: only the first five link column items render.
export const TooManyColumns = {
  args: { linkColumns: SEVEN_COLUMNS },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '5');
    await expect(columnHeadings(canvasElement)).toEqual(FIRST_FIVE_HEADINGS);
    await expect(canvasElement.querySelector('.xe-footer-v2-placeholder')).toBeNull();
  },
};

// In the editor, the 6th and 7th link column items show a notice (still
// selectable, so the author can remove them) instead of rendering.
export const EditorTooManyColumns = {
  args: { linkColumns: SEVEN_COLUMNS, socialLinks: '', legalLinks: '' },
  render: (args) => render(fieldsToRows(args), inEditor(itemModels(7, 0, 0))),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '5');
    await expect(columnHeadings(canvasElement)).toEqual(FIRST_FIVE_HEADINGS);
    [5, 6].forEach((index) => {
      const notice = itemElement(canvasElement, index);
      expect(notice.matches('xe-footer > span.xe-footer-v2-placeholder:not([slot])')).toBe(true);
      expect(notice).toHaveTextContent('Only 5 link columns are shown — remove this one');
      expect(notice).toHaveAttribute('data-aue-model', 'xe-footer-column-links');
    });
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-columns-full');
  },
};

// A second legal links item: one more than the footer shows.
const EXTRA_LEGAL_ITEM = linkList([['Cookie Notice', '#cookies']]);

// Published: only the first legal links item renders.
export const TooManyLegalLinks = {
  render: (args) => render([...fieldsToRows(args), [EXTRA_LEGAL_ITEM]]),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(canvasElement.querySelector('.xe-footer-v2-placeholder')).toBeNull();
  },
};

// In the editor, the second legal links item shows a notice (still
// selectable, so the author can remove it) instead of rendering.
export const EditorTooManyLegalLinks = {
  args: { linkColumns: '', socialLinks: '' },
  render: (args) => render(
    [...fieldsToRows(args), [EXTRA_LEGAL_ITEM]],
    inEditor(itemModels(0, 0, 2)),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    const notice = itemElement(canvasElement, 1);
    await expect(notice.matches('xe-footer > span.xe-footer-v2-placeholder[slot="legal"]')).toBe(true);
    await expect(notice).toHaveTextContent('Only one legal links item is shown');
    await expect(notice).toHaveAttribute('data-aue-model', 'xe-footer-legal-links');
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-legal-full');
  },
};

// Every kind of item at its limit: (+) offers nothing more.
export const EditorAllFull = {
  args: { linkColumns: SEVEN_COLUMNS },
  render: (args) => render(
    fieldsToRows(args),
    inEditor(itemModels(7, itemCount(args.socialLinks), legalRows(args.legalLinks).length)),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('.xe-footer-v2.block'))
      .toHaveAttribute('data-aue-filter', 'xe-footer-v2-columns-social-legal-full');
  },
};

// Published pages carry no editor filter, and none is added.
export const PublishedHasNoFilter = {
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('.xe-footer-v2.block')).not.toHaveAttribute('data-aue-filter');
  },
};

// --- Stories: footers authored with earlier models ---------------------------

// Created while the block was key-value: `name | value` rows (with link
// column slots), then the item rows.
export const KeyValueFooter = {
  render: (args) => render(keyValueRows(args)),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(4));
    await expectStaticLogo(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};

// Key-value column slots 1 and 4 only: blank slots are skipped.
export const KeyValueNonContiguousColumns = {
  render: (args) => render(keyValueRows(args, [COLUMNS[0], ['', []], ['', []], COLUMNS[2]])),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '2');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Support']);
  },
};

// Key-value footers with the old social / legal rich-text fields and no items.
export const KeyValueRichTextLinks = {
  render: (args) => {
    const rows = keyValueRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push(['social', SOCIAL_RICH_TEXT], ['legal', LEGAL_ITEMS]);
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // Icon-only rich-text links are recognized by their accessible name.
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL.map(([label, , icon]) => [label, '#', icon]));
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// The original positional layout (rich-text social / legal / footer links).
export const LegacyContent = {
  render: (args) => render(legacyRows(args)),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    await expectStaticLogo(canvasElement);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL.map(([label, , icon]) => [label, '#', icon]));
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};
