/*
 * Storybook stories for the XE Footer V2 block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer-v2/
 * _xe-footer-v2.json) one-to-one, so editing a control here is the same as editing
 * that field in the Universal Editor. Each model field maps to a Storybook
 * control type:
 *
 *   logo              reference (image) -> text control (asset URL)
 *   logoAlt           text              -> text control
 *   copyright         richtext          -> text control (HTML)
 *   social            richtext          -> text control (HTML)
 *   legal             richtext          -> text control (HTML)
 *   footerlinks       richtext          -> text control (HTML)
 *   banner_background reference (image) -> text control (asset URL)
 *   banner_tagline    text              -> text control
 *
 * `fieldsToRows` assembles the args into the row/cell structure the block's
 * decorator expects (logo, copyright, social, legal, footerlinks, then the
 * banner as the last image-bearing row) — the same DOM AEM produces from these
 * fields at publish time. renderBlock() then wraps it in the real EDS chain,
 * loads the shipped CSS, and runs decorate().
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer-v2.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

// --- Default field values (a realistic, fully-authored footer) --------------
const defaults = {
  logo: '/icons/xcel-logo-white.svg',
  logoAlt: 'Xcel',
  copyright: '<p>© 2026 Xcel Energy. All rights reserved.</p>',
  social: [
    '<p>',
    '<a href="#" aria-label="Facebook">', picture('/icons/facebook.svg', 'Facebook'), '</a>',
    '<a href="#" aria-label="X">', picture('/icons/x.svg', 'X'), '</a>',
    '<a href="#" aria-label="Instagram">', picture('/icons/instagram.svg', 'Instagram'), '</a>',
    '<a href="#" aria-label="LinkedIn">', picture('/icons/linkedin.svg', 'LinkedIn'), '</a>',
    '<a href="#" aria-label="YouTube">', picture('/icons/youtube.svg', 'YouTube'), '</a>',
    '</p>',
  ].join('\n'),
  legal: [
    '<ul>',
    '<li><a href="#">Privacy Policy</a></li>',
    '<li><a href="#">Terms of Use</a></li>',
    '<li><a href="#">Cookie Preferences</a></li>',
    '</ul>',
  ].join('\n'),
  footerlinks: [
    '<p>Company</p>',
    '<ul><li><a href="#">About us</a></li><li><a href="#">Careers</a></li>'
      + '<li><a href="#">Newsroom</a></li><li><a href="#">Sustainability</a></li></ul>',
    '<p>Services</p>',
    '<ul><li><a href="#">Residential</a></li><li><a href="#">Business</a></li>'
      + '<li><a href="#">Renewable plans</a></li><li><a href="#">Usage insights</a></li></ul>',
    '<p>Support</p>',
    '<ul><li><a href="#">Contact us</a></li><li><a href="#">Help center</a></li>'
      + '<li><a href="#">Report an outage</a></li><li><a href="#">Billing &amp; payments</a></li></ul>',
  ].join('\n'),
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
};

/**
 * Build the authored row/cell structure from the model-field args, matching
 * what AEM renders for this block: every container field keeps its row (empty
 * when blank), since the decorator maps rows to fields by position. The banner
 * row (background + tagline) comes last and only when a background is set.
 */
function fieldsToRows(args) {
  const rows = [
    [args.logo ? picture(args.logo, args.logoAlt) : ''],
    [args.copyright || ''],
    [args.social || ''],
    [args.legal || ''],
    [args.footerlinks || ''],
  ];
  if (args.banner_background) {
    rows.push([`${picture(args.banner_background, 'Banner')}<p>${args.banner_tagline || ''}</p>`]);
  }
  return rows;
}

// argTypes drive the Controls panel — the Storybook analogue of the Universal
// Editor properties rail. Grouped by the two authoring zones of the block.
const argTypes = {
  logo: {
    control: 'text',
    description: 'Logo (reference) — asset URL for the footer logo.',
    table: { category: 'Brand' },
  },
  logoAlt: {
    control: 'text',
    description: 'Logo alt text.',
    table: { category: 'Brand' },
  },
  copyright: {
    control: 'text',
    description: 'Copyright (rich text) — HTML.',
    table: { category: 'Brand' },
  },
  social: {
    control: 'text',
    description: 'Social links (rich text) — HTML with linked social icons.',
    table: { category: 'Brand' },
  },
  legal: {
    control: 'text',
    description: 'Legal links (rich text) — HTML list of legal links.',
    table: { category: 'Brand' },
  },
  footerlinks: {
    control: 'text',
    description: 'Footer links (rich text) — heading + link-list pairs; each heading becomes a column.',
    table: { category: 'Links' },
  },
  banner_background: {
    control: 'text',
    description: 'Background (reference) — asset URL for the full-bleed banner image.',
    table: { category: 'Banner' },
  },
  banner_tagline: {
    control: 'text',
    description: 'Tagline — centered banner overlay text.',
    table: { category: 'Banner' },
  },
};

export default {
  title: 'Blocks/XE Footer V2',
  // A custom docs page lives in xe-footer-v2.mdx; don't also auto-generate one.
  argTypes,
  args: defaults,
  render: (args) => renderBlock({ name: 'xe-footer-v2', rows: fieldsToRows(args), decorate }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Xcel footer rendered with the @ignite/web footer composition: '
          + '<xe-footer> with slotted logo, copyright, social and legal links, '
          + '<xe-footer-column> link columns (an accordion below 1024px), and a '
          + 'full-bleed banner with a centered tagline. Controls map one-to-one '
          + 'to the block\'s authoring model, so this page mirrors Universal '
          + 'Editor authoring.',
      },
    },
  },
};

/** Waits for the Ignite footer to register and render its shadow DOM. */
async function upgraded(canvasElement) {
  const footer = canvasElement.querySelector('xe-footer');
  await waitFor(() => expect(footer.shadowRoot?.querySelector('footer')).toBeTruthy(), { timeout: 8000 });
  return footer;
}

const columnHeadings = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer-column')]
  .map((column) => column.getAttribute('heading'));

// The complete footer as authored on the site.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    // Column links become Ignite hyperlinks, wrapped in list items by the column.
    const firstColumn = canvasElement.querySelector('xe-footer-column');
    await expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink')).toHaveLength(4);
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
    await expect(canvas.getByText('© 2026 Xcel Energy. All rights reserved.')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('[slot="social"] a')).toHaveLength(5);
    await expect(canvasElement.querySelectorAll('[slot="legal"] xe-hyperlink')).toHaveLength(3);
    await expect(canvasElement.querySelector('[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
    // The hyperlink renders a real anchor in its shadow root.
    const link = canvasElement.querySelector('xe-hyperlink');
    await waitFor(() => expect(link.shadowRoot?.querySelector('a')).toHaveAttribute('href', '#'));
  },
};

// A single link column, exercising the desktop grid with one track.
export const SingleLinkColumn = {
  args: {
    footerlinks: [
      '<p>Company</p>',
      '<ul><li><a href="#">About us</a></li><li><a href="#">Careers</a></li>'
        + '<li><a href="#">Newsroom</a></li></ul>',
    ].join('\n'),
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '1');
    await expect(columnHeadings(canvasElement)).toEqual(['Company']);
  },
};

// Two link columns with a shorter tagline — a common real-world configuration.
export const TwoLinkColumns = {
  args: {
    footerlinks: [
      '<p>Company</p>',
      '<ul><li><a href="#">About us</a></li><li><a href="#">Careers</a></li>'
        + '<li><a href="#">Newsroom</a></li></ul>',
      '<p>Support</p>',
      '<ul><li><a href="#">Contact us</a></li><li><a href="#">Help center</a></li>'
        + '<li><a href="#">Report an outage</a></li></ul>',
    ].join('\n'),
    banner_tagline: 'Powering Tomorrow',
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Support']);
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Powering Tomorrow');
  },
};

// No logo authored — Ignite's built-in Xcel Energy logo (inverse) is used.
export const DefaultLogo = {
  args: { logo: '' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('xe-logo[slot="logo"]')).toHaveAttribute('variant', 'inverse');
  },
};
