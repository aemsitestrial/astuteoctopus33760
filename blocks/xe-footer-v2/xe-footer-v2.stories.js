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
 * Child items (their composite multi-field renders as a <ul> of links):
 *
 *   xe-footer-social-links  socialLinks (network + profile URL) -> "socialLinks" (HTML)
 *   xe-footer-legal-links   legalLinks (text + link)            -> "legalLinks" (HTML)
 *
 * The block is a key-value block, so `fieldsToRows` renders each non-empty
 * field as a `name | value` row — the markup AEM produces for
 * "key-value": true — followed by one single-cell row per child item. The
 * LegacyContent story instead renders the old positional layout (one
 * `footerlinks` rich-text field) that footers created before the switch
 * still use.
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

/** A <ul> of [text, href] links — how a link composite multi-field renders. */
const linkList = (pairs) => `<ul>${pairs.map(([text, href]) => `<li><a href="${href}">${text}</a></li>`).join('')}</ul>`;

// xe-footer-social-links: the link text is the "Network" select value.
const SOCIAL_ITEMS = linkList([
  ['facebook', 'https://www.facebook.com/XcelEnergy'],
  ['x', 'https://twitter.com/XcelEnergy'],
  ['instagram', 'https://www.instagram.com/xcelenergy'],
  ['linkedin', 'https://www.linkedin.com/company/xcel-energy'],
  ['youtube', 'https://www.youtube.com/XcelEnergyVideo'],
]);
const LEGAL_ITEMS = linkList([['Privacy Policy', '#'], ['Terms of Use', '#'], ['Cookie Preferences', '#']]);

// The legacy `social` / `legal` rich-text fields.
const SOCIAL_RICH_TEXT = [
  '<p>',
  '<a href="#" aria-label="Facebook">', picture('/icons/facebook.svg', 'Facebook'), '</a>',
  '<a href="#" aria-label="X">', picture('/icons/x.svg', 'X'), '</a>',
  '<a href="#" aria-label="Instagram">', picture('/icons/instagram.svg', 'Instagram'), '</a>',
  '<a href="#" aria-label="LinkedIn">', picture('/icons/linkedin.svg', 'LinkedIn'), '</a>',
  '<a href="#" aria-label="YouTube">', picture('/icons/youtube.svg', 'YouTube'), '</a>',
  '</p>',
].join('\n');
const LEGAL_RICH_TEXT = list(['Privacy Policy', 'Terms of Use', 'Cookie Preferences']);

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
  social: '',
  legal: '',
  ...columnsToArgs(COLUMNS),
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
  socialLinks: SOCIAL_ITEMS,
  legalLinks: LEGAL_ITEMS,
};

// Model field order (_xe-footer-v2.json) — the order key-value rows render in.
const FIELD_ORDER = [
  'logo', 'logoAlt', 'copyright', 'social', 'legal',
  ...Array.from({ length: COLUMN_SLOTS }, (_, i) => [column(i + 1, 'Heading'), column(i + 1, 'Links')]).flat(),
  'banner_background', 'banner_tagline',
];

/**
 * Renders the args as key-value rows (`[name, value]`) in model order,
 * omitting blank fields (image references render as pictures), then one
 * single-cell row per authored child item.
 */
function fieldsToRows(args) {
  const rows = FIELD_ORDER
    .filter((name) => args[name])
    .map((name) => {
      if (name === 'logo') return [name, picture(args.logo, args.logoAlt || '')];
      if (name === 'banner_background') return [name, picture(args.banner_background, '')];
      return [name, args[name]];
    });
  if (args.socialLinks) rows.push([args.socialLinks]);
  if (args.legalLinks) rows.push([args.legalLinks]);
  return rows;
}

/** The pre-key-value positional layout: one cell per field, banner last. */
function legacyRows(args) {
  const footerlinks = COLUMNS.map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join('');
  return [
    [picture(args.logo, args.logoAlt)],
    [args.copyright],
    [SOCIAL_RICH_TEXT],
    [LEGAL_RICH_TEXT],
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
  socialLinks: { control: 'text', description: 'XE Footer Social Links item — <ul> of links whose text is the network (facebook, x, instagram, linkedin, youtube).', table: { category: 'Child items' } },
  legalLinks: { control: 'text', description: 'XE Footer Legal Links item — <ul> of text + link pairs.', table: { category: 'Child items' } },
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

const ITEM_LABELS = {
  'xe-footer-social-links': 'XE Footer Social Links',
  'xe-footer-legal-links': 'XE Footer Legal Links',
};

/**
 * A decorate() that first instruments the child item rows (the single-cell
 * rows, in order) the way the Universal Editor serves them — component
 * resource, type, model and label — so stories can check the instrumentation
 * survives decoration and the items stay in the editor's content tree.
 */
const inEditor = (models) => (block) => {
  [...block.children].filter((row) => row.children.length === 1).forEach((row, index) => {
    const model = models[index];
    row.setAttribute('data-aue-resource', `urn:aemconnection:/content/xcel/index/jcr:content/root/section/xe_footer_v2/item_${index}`);
    row.setAttribute('data-aue-type', 'component');
    row.setAttribute('data-aue-model', model);
    row.setAttribute('data-aue-label', ITEM_LABELS[model]);
  });
  return decorate(block);
};

/** The instrumented element for child item `index` (see inEditor). */
const itemElement = (canvasElement, index) => canvasElement
  .querySelector(`[data-aue-resource$="/item_${index}"]`);

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

const EXPECTED_SOCIAL = [
  ['Facebook (opens in a new window)', 'https://www.facebook.com/XcelEnergy', 'faSquareFacebook'],
  ['X (opens in a new window)', 'https://twitter.com/XcelEnergy', 'faSquareXTwitter'],
  ['Instagram (opens in a new window)', 'https://www.instagram.com/xcelenergy', 'faInstagram'],
  ['LinkedIn (opens in a new window)', 'https://www.linkedin.com/company/xcel-energy', 'faSquareLinkedin'],
  ['YouTube (opens in a new window)', 'https://www.youtube.com/XcelEnergyVideo', 'faYoutube'],
];
const AUTHORED_LEGAL = [['Privacy Policy', '#'], ['Terms of Use', '#'], ['Cookie Preferences', '#']];

// The complete footer as authored on the site.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    // Column links are direct <xe-hyperlink variant="variant"> children; the
    // column then wraps each one in an <li> for its list.
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await expect(firstColumn).toHaveAttribute('heading', 'Company');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(4));
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
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

// Blank fields between filled ones (no copyright, no social item) don't
// misplace the rest — every field is read by its key.
export const BlankFields = {
  args: { copyright: '', socialLinks: '', banner_tagline: 'Powering Tomorrow' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Powering Tomorrow');
  },
};

// No social or legal links authored — the live Xcel Energy footer's links
// render as defaults.
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

// The items authored in the other order (legal first): each list is still
// recognized by its links, not its position.
export const ItemsReversed = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push([args.legalLinks], [args.socialLinks]);
    return renderBlock({ name: 'xe-footer-v2', rows, decorate });
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// If AEM renders the child items as key-value rows too, their field names
// (socialLinks / legalLinks) identify them.
export const ItemsAsKeyValueRows = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push(['socialLinks', args.socialLinks], ['legalLinks', args.legalLinks]);
    return renderBlock({ name: 'xe-footer-v2', rows, decorate });
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// No child items, but the legacy social / legal rich-text fields are filled:
// their links render in the same Ignite structure.
export const RichTextLinks = {
  args: {
    socialLinks: '', legalLinks: '', social: SOCIAL_RICH_TEXT, legal: LEGAL_RICH_TEXT,
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // Icon-only rich-text links are recognized by their accessible name and
    // become icon buttons (keeping the authored hrefs).
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL.map(([label, , icon]) => [label, '#', icon]));
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
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
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL.map(([label, , icon]) => [label, '#', icon]));
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};

// Universal Editor: each child item keeps its instrumentation on the first
// element rendered from it, so both appear in the editor's content tree.
export const EditorItems = {
  render: (args) => renderBlock({
    name: 'xe-footer-v2',
    rows: fieldsToRows(args),
    decorate: inEditor(['xe-footer-social-links', 'xe-footer-legal-links']),
  }),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    const social = itemElement(canvasElement, 0);
    const legal = itemElement(canvasElement, 1);
    await expect(social.matches('xe-footer > xe-icon-button[slot="social"]')).toBe(true);
    await expect(social).toHaveAttribute('data-aue-model', 'xe-footer-social-links');
    await expect(social).toHaveAttribute('data-aue-type', 'component');
    await expect(legal.matches('xe-footer > xe-hyperlink[slot="legal"]')).toBe(true);
    await expect(legal).toHaveAttribute('data-aue-model', 'xe-footer-legal-links');
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// Universal Editor: items just added (no links yet) render a placeholder that
// carries their instrumentation, instead of disappearing — and don't fall
// back to the default links.
export const EditorEmptyItems = {
  render: (args) => {
    const rows = fieldsToRows({ ...args, socialLinks: '', legalLinks: '' });
    rows.push([''], ['']);
    return renderBlock({
      name: 'xe-footer-v2',
      rows,
      decorate: inEditor(['xe-footer-social-links', 'xe-footer-legal-links']),
    });
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    const social = itemElement(canvasElement, 0);
    const legal = itemElement(canvasElement, 1);
    await expect(social.matches('span.xe-footer-v2-placeholder[slot="social"]')).toBe(true);
    await expect(social).toHaveTextContent('Add social links');
    await expect(legal.matches('span.xe-footer-v2-placeholder[slot="legal"]')).toBe(true);
    await expect(legal).toHaveTextContent('Add legal links');
    await expect(canvasElement.querySelectorAll('xe-icon-button')).toHaveLength(0);
    await expect(legalLinks(canvasElement)).toEqual([]);
  },
};

// Universal Editor: the item's model decides where it renders, even when its
// links would look like the other list (a legal page on facebook.com).
export const EditorModelWins = {
  render: (args) => renderBlock({
    name: 'xe-footer-v2',
    rows: fieldsToRows({ ...args, legalLinks: linkList([['Facebook terms', 'https://www.facebook.com/terms']]) }),
    decorate: inEditor(['xe-footer-social-links', 'xe-footer-legal-links']),
  }),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(legalLinks(canvasElement)).toEqual([['Facebook terms', 'https://www.facebook.com/terms']]);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
  },
};
