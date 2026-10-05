/*
 * Storybook stories for the XE Footer V3 block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer-v3/
 * _xe-footer-v3.json), grouped by its editor tabs:
 *
 *   Social        social_cta1…5 URL + social_cta1…5Text network (select)
 *   Legal         legal_cta1…3 URL + legal_cta1…3Text text
 *   Column Links  column_heading1…5 (text) + column_links1…5 (rich-text list)
 *   Banner        banner_background (reference) + banner_tagline (text)
 *
 * `fieldsToRows` renders the markup AEM produces: one row per field or
 * element group, in model order, empty or not — social, legal, columns,
 * banner. Within a group each link + text pair collapses into one <a>, and a
 * network chosen without a URL renders as text only. The logo and the
 * copyright (with the current year) are static, not authorable.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer-v3.js';
import { renderBlock, picture } from '../../.storybook/eds.js';
import { copyrightText } from '../../scripts/components/xe-footer-utils.js';

// The static copyright, with the current year.
const COPYRIGHT = copyrightText();

const SOCIAL_SLOTS = 5;
const LEGAL_SLOTS = 3;
const COLUMN_SLOTS = 5;
const NETWORKS = ['', 'facebook', 'x', 'instagram', 'linkedin', 'youtube'];

const SOCIAL = [
  ['facebook', 'https://www.facebook.com/XcelEnergy'],
  ['x', 'https://twitter.com/XcelEnergy'],
  ['instagram', 'https://www.instagram.com/xcelenergy'],
  ['linkedin', 'https://www.linkedin.com/company/xcel-energy'],
  ['youtube', 'https://www.youtube.com/XcelEnergyVideo'],
];
const LEGAL = [
  ['https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf', 'My Account Terms &amp; Conditions'],
  ['https://my.xcelenergy.com/s/privacy', 'Privacy'],
  ['https://corporate.my.xcelenergy.com/s/about/accessibility', 'Accessibility'],
];
const COLUMNS = [
  ['Company', ['Careers', 'Community', 'Corporate Governance', 'Filings &amp; Regulations']],
  ['Energy &amp; Environment', ['Sustainability', 'Energy Portfolio', 'Net-Zero Plan', 'Transmission', 'Bird Cam']],
  ['Partner Resources', ['Trade Partners', 'Builders &amp; Remodelers', 'Property Managers']],
];

const list = (labels) => `<ul>${labels.map((label) => `<li><a href="#">${label}</a></li>`).join('')}</ul>`;

/** Flat args for the slotted fields, e.g. social_cta1 / social_cta1Text. */
function slotArgs({ social = [], legal = [], columns = [] } = {}) {
  const args = {};
  for (let i = 1; i <= SOCIAL_SLOTS; i += 1) {
    const [network, url] = social[i - 1] || ['', ''];
    args[`social_cta${i}Text`] = network;
    args[`social_cta${i}`] = url;
  }
  for (let i = 1; i <= LEGAL_SLOTS; i += 1) {
    const [url, text] = legal[i - 1] || ['', ''];
    args[`legal_cta${i}`] = url;
    args[`legal_cta${i}Text`] = text;
  }
  for (let i = 1; i <= COLUMN_SLOTS; i += 1) {
    const [heading, links] = columns[i - 1] || ['', []];
    args[`column_heading${i}`] = heading;
    args[`column_links${i}`] = links.length ? list(links) : '';
  }
  return args;
}

const defaults = {
  ...slotArgs({ social: SOCIAL, legal: LEGAL, columns: COLUMNS }),
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
};

/** A link + text pair as AEM collapses it: <a> with both, text alone without a URL. */
function collapsed(url, text) {
  if (url && text) return `<p><a href="${url}">${text}</a></p>`;
  return text ? `<p>${text}</p>` : '';
}

/** The four rows AEM renders for the model, in order (blank groups are empty cells). */
function fieldsToRows(args) {
  const social = [];
  for (let i = 1; i <= SOCIAL_SLOTS; i += 1) social.push(collapsed(args[`social_cta${i}`], args[`social_cta${i}Text`]));
  const legal = [];
  for (let i = 1; i <= LEGAL_SLOTS; i += 1) legal.push(collapsed(args[`legal_cta${i}`], args[`legal_cta${i}Text`]));
  const columns = [];
  for (let i = 1; i <= COLUMN_SLOTS; i += 1) {
    if (args[`column_heading${i}`]) columns.push(`<p>${args[`column_heading${i}`]}</p>`);
    if (args[`column_links${i}`]) columns.push(args[`column_links${i}`]);
  }
  const banner = [
    args.banner_background ? picture(args.banner_background, '') : '',
    args.banner_tagline ? `<p>${args.banner_tagline}</p>` : '',
  ].join('');
  return [
    [social.join('')],
    [legal.join('')],
    [columns.join('')],
    [banner],
  ];
}

// argTypes drive the Controls panel, grouped like the editor's tabs.
const argTypes = {
  banner_background: { control: 'text', description: 'Banner Image (reference) — asset URL for the full-width background image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Banner Tagline (text) — centered over the banner image.', table: { category: 'Banner' } },
};
for (let i = 1; i <= SOCIAL_SLOTS; i += 1) {
  argTypes[`social_cta${i}Text`] = {
    control: 'select', options: NETWORKS, description: `Social Link ${i} Network (select).`, table: { category: 'Social Media' },
  };
  argTypes[`social_cta${i}`] = { control: 'text', description: `Social Link ${i} URL.`, table: { category: 'Social Media' } };
}
for (let i = 1; i <= LEGAL_SLOTS; i += 1) {
  argTypes[`legal_cta${i}`] = { control: 'text', description: `Legal Link ${i} URL.`, table: { category: 'Legal Links' } };
  argTypes[`legal_cta${i}Text`] = { control: 'text', description: `Legal Link ${i} Text.`, table: { category: 'Legal Links' } };
}
for (let i = 1; i <= COLUMN_SLOTS; i += 1) {
  argTypes[`column_heading${i}`] = { control: 'text', description: `Column ${i} Heading (text).`, table: { category: 'Link Columns' } };
  argTypes[`column_links${i}`] = { control: 'text', description: `Column ${i} Links (rich text) — a bulleted list of links.`, table: { category: 'Link Columns' } };
}

const render = (rows, decorator = decorate) => renderBlock({ name: 'xe-footer-v3', rows, decorate: decorator });

export default {
  title: 'Blocks/XE Footer V3',
  // A custom docs page lives in xe-footer-v3.mdx; don't also auto-generate one.
  argTypes,
  args: defaults,
  render: (args) => render(fieldsToRows(args)),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Xcel footer rendered with the @ignite/web footer composition, '
          + 'authored entirely on the block in fixed slots: up to 5 social links, '
          + '3 legal links and 5 link columns, plus the banner, with the static Xcel Energy logo and copyright. '
          + 'Controls map one-to-one to the authoring model.',
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

/**
 * The static Ignite logo: inverse, medium, labelled, linking to the homepage
 * (the link renders in its shadow root).
 */
async function expectStaticLogo(canvasElement, selector = 'xe-footer > xe-logo[slot="logo"]') {
  const logo = canvasElement.querySelector(selector);
  await expect(logo).toHaveAttribute('variant', 'inverse');
  await expect(logo).toHaveAttribute('size', 'md');
  await expect(logo).toHaveAttribute('href', '/');
  await expect(logo).toHaveAttribute('label', 'Xcel Energy Home');
  await waitFor(() => expect(logo.shadowRoot?.querySelector('a')).toHaveAttribute('href', '/'), { timeout: 8000 });
}

const columnHeadings = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer > xe-footer-column')]
  .map((column) => column.getAttribute('heading'));

/** The social icon buttons as [aria-label, href, icon], once rendered. */
async function socialLinks(canvasElement) {
  const buttons = [...canvasElement.querySelectorAll('xe-footer > xe-icon-button[slot="social"]')];
  await waitFor(() => expect(buttons.every((b) => b.shadowRoot?.querySelector('a'))).toBe(true));
  return buttons.map((button) => [
    button.shadowRoot.querySelector('a').getAttribute('aria-label'),
    button.getAttribute('href'),
    button.querySelector('xe-icon').getAttribute('icon'),
  ]);
}

/** The legal links as [text, href]. */
const legalLinks = (canvasElement) => [...canvasElement.querySelectorAll('xe-footer > xe-hyperlink[slot="legal"]')]
  .map((link) => [link.textContent, link.getAttribute('href')]);

const EXPECTED_SOCIAL = [
  ['Facebook (opens in a new window)', 'https://www.facebook.com/XcelEnergy', 'faSquareFacebook'],
  ['X (opens in a new window)', 'https://twitter.com/XcelEnergy', 'faSquareXTwitter'],
  ['Instagram (opens in a new window)', 'https://www.instagram.com/xcelenergy', 'faInstagram'],
  ['LinkedIn (opens in a new window)', 'https://www.linkedin.com/company/xcel-energy', 'faSquareLinkedin'],
  ['YouTube (opens in a new window)', 'https://www.youtube.com/XcelEnergyVideo', 'faYoutube'],
];

// --- Stories -----------------------------------------------------------------

// A fully authored footer: 5 social links, 3 legal links, 3 of 5 columns.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    await expectStaticLogo(canvasElement);
    // The copyright is static, with the current year.
    await expect(canvasElement.querySelector('xe-footer > span[slot="copyright"]'))
      .toHaveTextContent(COPYRIGHT);
    await expect(canvas.getByText(COPYRIGHT)).toBeInTheDocument();
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Energy & Environment', 'Partner Resources']);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(4));
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual([
      ['My Account Terms & Conditions', LEGAL[0][0]],
      ['Privacy', LEGAL[1][0]],
      ['Accessibility', LEGAL[2][0]],
    ]);
    await expect([...canvasElement.querySelectorAll('xe-hyperlink[slot="legal"]')].every((l) => l.hasAttribute('trailing-icon'))).toBe(true);
    await expect(canvasElement.querySelector('xe-footer > img[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};

// Nothing authored: the static logo and copyright, the default social / legal
// links, no columns or banner.
export const EmptyFooter = {
  args: {
    banner_background: '', banner_tagline: '', ...slotArgs(),
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toHaveTextContent(COPYRIGHT);
    await expect(footer).not.toHaveAttribute('columns');
    await expect(canvasElement.querySelectorAll('xe-footer-column')).toHaveLength(0);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual([
      ['Online Terms of Use', 'https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf'],
      ['Privacy', 'https://my.xcelenergy.com/s/privacy'],
      ['Accessibility', 'https://corporate.my.xcelenergy.com/s/about/accessibility'],
    ]);
    await expect(canvasElement.querySelector('[slot="banner-image"]')).toBeNull();
  },
};

// Slots filled out of order and partly: social 1 and 3 (2 has a network but
// no URL), legal 2 only, columns 2 and 4 only. Blank slots render nothing.
export const PartialSlots = {
  args: slotArgs({
    social: [SOCIAL[0], ['x', ''], SOCIAL[2]],
    legal: [['', ''], LEGAL[1]],
    columns: [['', []], COLUMNS[1], ['', []], COLUMNS[2]],
  }),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    const [facebook, , instagram] = EXPECTED_SOCIAL;
    await expect(await socialLinks(canvasElement)).toEqual([facebook, instagram]);
    await expect(legalLinks(canvasElement)).toEqual([['Privacy', LEGAL[1][0]]]);
    await expect(footer).toHaveAttribute('columns', '2');
    await expect(columnHeadings(canvasElement)).toEqual(['Energy & Environment', 'Partner Resources']);
  },
};

// Universal Editor: field instrumentation on the authored elements moves onto
// the elements rendered from them, so each field stays selectable.
export const EditorInstrumentation = {
  render: (args) => render(fieldsToRows(args), (block) => {
    const [socialRow, legalRow] = block.children;
    socialRow.querySelector('a').setAttribute('data-aue-prop', 'social_cta1');
    legalRow.querySelector('a').setAttribute('data-aue-prop', 'legal_cta1');
    return decorate(block);
  }),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[data-aue-prop="social_cta1"]').matches('xe-icon-button[slot="social"]')).toBe(true);
    await expect(canvasElement.querySelector('[data-aue-prop="legal_cta1"]').matches('xe-hyperlink[slot="legal"]')).toBe(true);
  },
};

// Published before the copyright became static: the old copyright row comes
// first. It's skipped — the other groups still land in place and the static
// copyright, with the current year, renders.
export const LegacyCopyrightRow = {
  render: (args) => render([['<p>© 2024 Xcel Energy Inc. All rights reserved.</p>'], ...fieldsToRows(args)]),
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toHaveTextContent(COPYRIGHT);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toHaveLength(3);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};
