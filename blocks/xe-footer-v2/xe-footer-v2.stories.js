/*
 * Storybook stories for the XE Footer V2 block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer-v2/
 * _xe-footer-v2.json) one-to-one, so editing a control here is the same as
 * editing that field in the Universal Editor:
 *
 *   logo + logoAlt          reference + text  -> "logo" / "logoAlt" (collapsed into one image)
 *   copyright               richtext          -> "copyright" (HTML)
 *   banner_background       reference         -> "banner_background" (asset URL)
 *   banner_tagline          text              -> "banner_tagline" (grouped with the background)
 *
 * Child items (the block's filter), each in its own row:
 *
 *   xe-footer-column-links  heading + links (rich-text list), grouped into one cell
 *                             -> "linkColumns" (heading + list pairs, one item each)
 *   xe-footer-social-links  network select + profile URL -> "socialLinks" (links, one item each)
 *   xe-footer-legal-links   text + link                  -> "legalLinks" (links, one item each)
 *
 * `fieldsToRows` renders the container markup AEM produces: one single-cell
 * row per field (logo, copyright, banner) followed by one row per child item.
 * Other stories cover footers created while the block was key-value
 * (`name | value` rows, with link columns) and the original positional layout.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer-v2.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

/** A <ul> of [text, href] links (rich-text lists, and the link sets split into items). */
const linkList = (pairs) => `<ul>${pairs.map(([text, href]) => `<li><a href="${href}">${text}</a></li>`).join('')}</ul>`;
const list = (labels) => linkList(labels.map((label) => [label, '#']));

const COLUMNS = [
  ['Company', ['About us', 'Careers', 'Newsroom', 'Sustainability']],
  ['Services', ['Residential', 'Business', 'Renewable plans', 'Usage insights']],
  ['Support', ['Contact us', 'Help center', 'Report an outage', 'Billing &amp; payments']],
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
  logo: '/icons/xcel-logo-white.svg',
  logoAlt: 'Xcel',
  copyright: '<p>© 2026 Xcel Energy. All rights reserved.</p>',
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
  linkColumns: COLUMNS.map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join(''),
  socialLinks: SOCIAL_ITEMS,
  legalLinks: LEGAL_ITEMS,
};

/**
 * One item row per link in `html` (the socialLinks / legalLinks controls):
 * each item's link + text collapse into a single <a>.
 */
function itemRows(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('a')].map((anchor) => [`<p>${anchor.outerHTML}</p>`]);
}

/** How many item rows `html` renders as. */
const itemCount = (html) => itemRows(html).length;

/**
 * One link column item row per heading in `html` (the linkColumns control):
 * the item's heading + links are grouped into one cell, <p>heading</p><ul>…</ul>.
 */
function columnRows(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = [];
  [...doc.body.children].forEach((node) => {
    if (node.matches('p')) rows.push([node.outerHTML]);
    else if (rows.length) rows[rows.length - 1][0] += node.outerHTML;
  });
  return rows;
}

/**
 * The container markup: one single-cell row per non-empty field in model
 * order — logo (alt collapsed in), copyright, banner (background + tagline
 * grouped) — then one row per child item (one per link).
 */
function fieldsToRows(args) {
  const rows = [];
  if (args.logo) rows.push([picture(args.logo, args.logoAlt || '')]);
  if (args.copyright) rows.push([args.copyright]);
  if (args.banner_background || args.banner_tagline) {
    const background = args.banner_background ? picture(args.banner_background, '') : '';
    rows.push([`${background}${args.banner_tagline ? `<p>${args.banner_tagline}</p>` : ''}`]);
  }
  rows.push(
    ...columnRows(args.linkColumns),
    ...itemRows(args.socialLinks),
    ...itemRows(args.legalLinks),
  );
  return rows;
}

/** Key-value rows of a footer created while the block was key-value (with column slots). */
function keyValueRows(args, columns = COLUMNS) {
  const rows = [['logo', picture(args.logo, '')], ['logoAlt', args.logoAlt], ['copyright', args.copyright]];
  columns.forEach(([heading, links], index) => {
    if (!links.length) return;
    rows.push([`column${index + 1}Heading`, heading], [`column${index + 1}Links`, list(links)]);
  });
  rows.push(['banner_background', picture(args.banner_background, '')], ['banner_tagline', args.banner_tagline]);
  rows.push(...itemRows(args.socialLinks), ...itemRows(args.legalLinks));
  return rows;
}

/** The original positional layout: logo, copyright, social, legal, footer links, banner. */
function legacyRows(args) {
  const footerlinks = COLUMNS.map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join('');
  return [
    [picture(args.logo, args.logoAlt)],
    [args.copyright],
    [SOCIAL_RICH_TEXT],
    [LEGAL_ITEMS],
    [footerlinks],
    [`${picture(args.banner_background, 'Banner')}<p>${args.banner_tagline}</p>`],
  ];
}

const COLUMN = 'xe-footer-column-links';
const SOCIAL = 'xe-footer-social-links';
const LEGAL = 'xe-footer-legal-links';
const ITEM_LABELS = {
  [COLUMN]: 'XE Footer Link Column', [SOCIAL]: 'XE Footer Social Link', [LEGAL]: 'XE Footer Legal Link',
};

/** The item models of a footer's item rows, in order: link columns, social, legal. */
const itemModels = (columns, social, legal) => [
  ...Array(columns).fill(COLUMN), ...Array(social).fill(SOCIAL), ...Array(legal).fill(LEGAL),
];

/**
 * A decorate() that first instruments the last `models.length` rows (the
 * child items) the way the Universal Editor serves them — component resource,
 * type, model and label — so stories can check the instrumentation survives
 * decoration and the items stay in the editor's content tree.
 */
const inEditor = (models) => (block) => {
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

const render = (rows, decorator = decorate) => renderBlock({ name: 'xe-footer-v2', rows, decorate: decorator });

// argTypes drive the Controls panel — the Storybook analogue of the Universal
// Editor properties rail.
const argTypes = {
  logo: { control: 'text', description: 'Logo (reference) — asset URL for the footer logo.', table: { category: 'Brand' } },
  logoAlt: { control: 'text', description: 'Logo alt text.', table: { category: 'Brand' } },
  copyright: { control: 'text', description: 'Copyright (rich text) — HTML.', table: { category: 'Brand' } },
  banner_background: { control: 'text', description: 'Background (reference) — asset URL for the full-bleed banner image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Tagline — centered banner overlay text.', table: { category: 'Banner' } },
  linkColumns: { control: 'text', description: 'XE Footer Link Column items — one item per heading: <p>heading</p> followed by a <ul> of links.', table: { category: 'Child items' } },
  socialLinks: { control: 'text', description: 'XE Footer Social Link items — one item per link; the link text is the network (facebook, x, instagram, linkedin, youtube).', table: { category: 'Child items' } },
  legalLinks: { control: 'text', description: 'XE Footer Legal Link items — one item per link (text + link).', table: { category: 'Child items' } },
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
          + '<xe-footer> with the slotted logo and copyright, social icon buttons '
          + 'and legal links from its XE Footer Social Links / Legal Links child '
          + 'items, link columns (an accordion below 1024px), and a full-bleed '
          + 'banner with a centered tagline. Controls map one-to-one to the '
          + 'authoring model.',
      },
    },
  },
};

// --- Helpers for the play functions -----------------------------------------

/** Waits for the Ignite footer to register and render its shadow DOM. */
async function upgraded(canvasElement) {
  const footer = canvasElement.querySelector('xe-footer');
  await waitFor(() => expect(footer.shadowRoot?.querySelector('footer')).toBeTruthy(), { timeout: 8000 });
  return footer;
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
    // One <xe-footer-column heading="…"> per link column item, with direct
    // <xe-hyperlink variant="variant"> children the column wraps in <li>s.
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
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
    rows.push(...itemRows(args.legalLinks), ...itemRows(args.socialLinks));
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
  },
};

// Blank fields don't shift the rest: no copyright and a banner without a
// tagline still land as banner, not logo.
export const BlankFields = {
  args: { copyright: '', banner_tagline: '' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toBeNull();
  },
};

// A copyright line containing a link stays the copyright, not a legal item.
export const CopyrightWithLink = {
  args: { copyright: '<p>© 2026 Xcel Energy Inc. <a href="#">Legal notices</a></p>' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('span[slot="copyright"] a')).toHaveTextContent('Legal notices');
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
    rows.push(['<p>Investors</p>'], ...itemRows(args.socialLinks), ...itemRows(args.legalLinks));
    return render(rows);
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toHaveTextContent('© 2026 Xcel Energy');
  },
};

// No logo authored — Ignite's built-in Xcel Energy logo (inverse) is used.
export const DefaultLogo = {
  args: { logo: '' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('xe-logo[slot="logo"]')).toHaveAttribute('variant', 'inverse');
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
  },
};

// --- Stories: the Universal Editor --------------------------------------------

// Each child item keeps its instrumentation on the element rendered from it,
// so every item appears in the editor's content tree.
export const EditorItems = {
  render: (args) => render(
    fieldsToRows(args),
    inEditor(itemModels(
      columnRows(args.linkColumns).length,
      itemCount(args.socialLinks),
      itemCount(args.legalLinks),
    )),
  ),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    // 3 link columns (item_0–2), 5 social items (item_3–7) and 3 legal items
    // (item_8–10), each its own element.
    const elements = [...Array(11).keys()].map((index) => itemElement(canvasElement, index));
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
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
    await expect(canvasElement.querySelector('span[slot="copyright"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('img[slot="banner-image"]')).toBeInTheDocument();
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
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
    await expect(legal).toHaveTextContent('Add a legal link');
    await expect(canvasElement.querySelectorAll('xe-icon-button')).toHaveLength(0);
    await expect(legalLinks(canvasElement)).toEqual([]);
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
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
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
    await expect(canvasElement.querySelector('[slot="logo"] img')).toHaveAttribute('alt', 'Xcel');
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL.map(([label, , icon]) => [label, '#', icon]));
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};
