/*
 * Storybook stories for the XE Footer V2 block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer-v2/
 * _xe-footer-v2.json) one-to-one, so editing a control here is the same as
 * editing that field in the Universal Editor:
 *
 *   logo                    reference (image) -> text control (asset URL)
 *   logoAlt                 text              -> text control
 *   copyright               richtext          -> text control (HTML)
 *   social                  richtext          -> text control (HTML)
 *   legal                   richtext          -> text control (HTML)
 *   column1Heading … 5      text              -> text control, one group per column
 *   column1Links … 5        richtext          -> text control (HTML list of links)
 *   banner_background       reference (image) -> text control (asset URL)
 *   banner_tagline          text              -> text control
 *
 * The block is a key-value block, so `fieldsToRows` renders each non-empty
 * field as a `name | value` row — the markup AEM produces for
 * "key-value": true. The LegacyContent story instead renders the old
 * positional layout (one `footerlinks` rich-text field) that footers created
 * before the switch still use.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer-v2.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

const COLUMN_SLOTS = 5;

const list = (links) => `<ul>${links.map((label) => `<li><a href="#">${label}</a></li>`).join('')}</ul>`;

const COLUMNS = [
  ['Company', ['About us', 'Careers', 'Newsroom', 'Sustainability']],
  ['Services', ['Residential', 'Business', 'Renewable plans', 'Usage insights']],
  ['Support', ['Contact us', 'Help center', 'Report an outage', 'Billing &amp; payments']],
];

/** Flat arg key for a column slot field, e.g. column(2, 'Links') -> 'column2Links'. */
const column = (slot, field) => `column${slot}${field}`;

/** Spreads [heading, links[]] pairs across the fixed column slots. */
function columnsToArgs(columns) {
  const args = {};
  for (let slot = 1; slot <= COLUMN_SLOTS; slot += 1) {
    const [heading, links] = columns[slot - 1] || ['', []];
    args[column(slot, 'Heading')] = heading;
    args[column(slot, 'Links')] = links.length ? list(links) : '';
  }
  return args;
}

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
  legal: list(['Privacy Policy', 'Terms of Use', 'Cookie Preferences']),
  ...columnsToArgs(COLUMNS),
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
};

// Model field order (_xe-footer-v2.json) — the order key-value rows render in.
const FIELD_ORDER = [
  'logo', 'logoAlt', 'copyright', 'social', 'legal',
  ...Array.from({ length: COLUMN_SLOTS }, (_, i) => [column(i + 1, 'Heading'), column(i + 1, 'Links')]).flat(),
  'banner_background', 'banner_tagline',
];

/**
 * Renders the args as key-value rows (`[name, value]`) in model order,
 * omitting blank fields. Image references render as pictures.
 */
function fieldsToRows(args) {
  return FIELD_ORDER
    .filter((name) => args[name])
    .map((name) => {
      if (name === 'logo') return [name, picture(args.logo, args.logoAlt || '')];
      if (name === 'banner_background') return [name, picture(args.banner_background, '')];
      return [name, args[name]];
    });
}

/** The pre-key-value positional layout: one cell per field, banner last. */
function legacyRows(args) {
  const footerlinks = COLUMNS.map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join('');
  return [
    [picture(args.logo, args.logoAlt)],
    [args.copyright],
    [args.social],
    [args.legal],
    [footerlinks],
    [`${picture(args.banner_background, 'Banner')}<p>${args.banner_tagline}</p>`],
  ];
}

// argTypes drive the Controls panel — the Storybook analogue of the Universal
// Editor properties rail. Column slots get one group each, like a multifield.
const argTypes = {
  logo: { control: 'text', description: 'Logo (reference) — asset URL for the footer logo.', table: { category: 'Brand' } },
  logoAlt: { control: 'text', description: 'Logo alt text.', table: { category: 'Brand' } },
  copyright: { control: 'text', description: 'Copyright (rich text) — HTML.', table: { category: 'Brand' } },
  social: { control: 'text', description: 'Social links (rich text) — HTML with linked social icons.', table: { category: 'Brand' } },
  legal: { control: 'text', description: 'Legal links (rich text) — HTML list of legal links.', table: { category: 'Brand' } },
  banner_background: { control: 'text', description: 'Background (reference) — asset URL for the full-bleed banner image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Tagline — centered banner overlay text.', table: { category: 'Banner' } },
};
for (let slot = 1; slot <= COLUMN_SLOTS; slot += 1) {
  const category = `Column ${slot}`;
  argTypes[column(slot, 'Heading')] = { control: 'text', description: `Column ${slot} heading (text).`, table: { category } };
  argTypes[column(slot, 'Links')] = { control: 'text', description: `Column ${slot} links (rich text) — list of links; the column renders only when it has links.`, table: { category } };
}

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
          + 'up to five <xe-footer-column> link columns (an accordion below '
          + '1024px), and a full-bleed banner with a centered tagline. The block '
          + 'is modeled as key-value, so every field is read by name. Controls '
          + 'map one-to-one to the authoring model.',
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
  .map((col) => col.getAttribute('heading'));

// The complete footer as authored on the site.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    // Column links become Ignite hyperlinks, each in a list item.
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

// Only slots 1 and 4 filled: blank slots are skipped and nothing shifts.
export const NonContiguousColumns = {
  args: columnsToArgs([COLUMNS[0], ['', []], ['', []], COLUMNS[2]]),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '2');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Support']);
  },
};

// All five slots filled — the Ignite footer's default five-track grid.
export const FiveColumns = {
  args: columnsToArgs([
    ...COLUMNS,
    ['Safety', ['Gas safety', 'Call before you dig', 'Storm safety']],
    ['Investors', ['Financials', 'Governance', 'Events']],
  ]),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '5');
    await expect(columnHeadings(canvasElement)).toHaveLength(5);
  },
};

// Blank fields between filled ones (no copyright, no social) don't misplace
// the rest — every field is read by its key.
export const BlankFields = {
  args: { copyright: '', social: '', banner_tagline: 'Powering Tomorrow' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(canvasElement.querySelector('[slot="social"]')).toBeNull();
    await expect(canvasElement.querySelectorAll('[slot="legal"] xe-hyperlink')).toHaveLength(3);
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
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

// A footer authored before the key-value model: positional rows and one
// `footerlinks` rich-text field. It still renders the same columns.
export const LegacyContent = {
  render: (args) => renderBlock({ name: 'xe-footer-v2', rows: legacyRows(args), decorate }),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
    await expect(canvasElement.querySelectorAll('[slot="legal"] xe-hyperlink')).toHaveLength(3);
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};
