/*
 * Storybook stories for the XE Footer block (@ignite/web footer composition).
 *
 * The controls mirror the block's authoring model (blocks/xe-footer/
 * _xe-footer.json) one-to-one:
 *
 *   copyright          text              -> "copyright" (plain text)
 *   social             richtext          -> "social" (HTML: linked social icons)
 *   legal              richtext          -> "legal" (HTML: a list of links)
 *   footerlinks        richtext          -> "footerlinks" (HTML: heading + list pairs)
 *   banner_background  reference         -> "banner_background" (asset URL)
 *   banner_tagline     text              -> "banner_tagline" (grouped with the background)
 *
 * `fieldsToRows` renders the markup AEM produces: one row per field or element
 * group, in model order, empty or not — copyright, social, legal, footerlinks,
 * banner. The logo isn't authorable: the decorator adds Ignite's static
 * <xe-logo>, linking to the homepage.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-footer.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

const list = (labels) => `<ul>${labels.map((label) => `<li><a href="#">${label}</a></li>`).join('')}</ul>`;

const NETWORKS = [
  ['Facebook', 'https://www.facebook.com/XcelEnergy', 'facebook'],
  ['X', 'https://twitter.com/XcelEnergy', 'x'],
  ['Instagram', 'https://www.instagram.com/xcelenergy', 'instagram'],
  ['LinkedIn', 'https://www.linkedin.com/company/xcel-energy', 'linkedin'],
  ['YouTube', 'https://www.youtube.com/XcelEnergyVideo', 'youtube'],
];

// Social links as icon images, each labelled with its network.
const SOCIAL_PICTURES = `<p>${NETWORKS.map(([label, href, icon]) => `<a href="${href}" aria-label="${label}">${picture(`/icons/${icon}.svg`, label)}</a>`).join('')}</p>`;

// The same links authored with EDS icons (:facebook: …), which render as
// <span class="icon icon-facebook"> with no text, label or alt.
const SOCIAL_EDS_ICONS = `<p>${NETWORKS.map(([, href, icon]) => `<a href="${href}"><span class="icon icon-${icon}"></span></a>`).join('')}</p>`;

const FOOTER_LINKS = [
  ['Company', ['About us', 'Careers', 'Newsroom', 'Sustainability']],
  ['Services', ['Residential', 'Business', 'Renewable plans', 'Usage insights']],
  ['Support', ['Contact us', 'Help center', 'Report an outage', 'Billing &amp; payments']],
].map(([heading, links]) => `<p>${heading}</p>${list(links)}`).join('');

// --- Default field values (a realistic, fully-authored footer) --------------
const defaults = {
  copyright: '© 2026 Xcel Energy Inc. All rights reserved.',
  social: SOCIAL_PICTURES,
  legal: list(['Privacy Policy', 'Terms of Use', 'Cookie Preferences']),
  footerlinks: FOOTER_LINKS,
  banner_background: 'https://picsum.photos/1600/400?grayscale',
  banner_tagline: 'Our Energy, Your Power',
};

/** The five rows AEM renders for the model, in order (blank fields are empty cells). */
function fieldsToRows(args) {
  const banner = [
    args.banner_background ? picture(args.banner_background, '') : '',
    args.banner_tagline ? `<p>${args.banner_tagline}</p>` : '',
  ].join('');
  return [
    [args.copyright ? `<p>${args.copyright}</p>` : ''],
    [args.social || ''],
    [args.legal || ''],
    [args.footerlinks || ''],
    [banner],
  ];
}

// argTypes drive the Controls panel — the Storybook analogue of the Universal
// Editor properties rail.
const argTypes = {
  copyright: { control: 'text', description: 'Copyright Text (plain text).', table: { category: 'General' } },
  social: { control: 'text', description: 'Social Media Links (rich text) — linked social icons.', table: { category: 'Social Media' } },
  legal: { control: 'text', description: 'Legal Links (rich text) — a bulleted list of links.', table: { category: 'Legal Links' } },
  footerlinks: { control: 'text', description: 'Link Columns (rich text) — heading + link-list pairs; each heading becomes a column.', table: { category: 'Link Columns' } },
  banner_background: { control: 'text', description: 'Banner Image (reference) — asset URL for the full-width background image.', table: { category: 'Banner' } },
  banner_tagline: { control: 'text', description: 'Banner Tagline (text) — centered over the banner image.', table: { category: 'Banner' } },
};

const render = (rows, decorator = decorate) => renderBlock({ name: 'xe-footer', rows, decorate: decorator });

export default {
  title: 'Blocks/XE Footer',
  // A custom docs page lives in xe-footer.mdx; don't also auto-generate one.
  argTypes,
  args: defaults,
  render: (args) => render(fieldsToRows(args)),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Xcel footer rendered with the @ignite/web footer composition: the '
          + 'static logo, copyright, social icon buttons, legal links, link '
          + 'columns (an accordion below 1024px) and a full-bleed banner with a '
          + 'centered tagline. Controls map one-to-one to the authoring model.',
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

/** The static Ignite logo: inverse, medium, labelled, linking to the homepage. */
async function expectStaticLogo(canvasElement) {
  const logo = canvasElement.querySelector('xe-footer > xe-logo[slot="logo"]');
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
const AUTHORED_LEGAL = [['Privacy Policy', '#'], ['Terms of Use', '#'], ['Cookie Preferences', '#']];

// --- Stories -----------------------------------------------------------------

// The complete footer as authored on the site.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = await upgraded(canvasElement);
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('xe-footer > span[slot="copyright"]'))
      .toHaveTextContent('© 2026 Xcel Energy Inc. All rights reserved.');
    await expect(canvas.getByText('© 2026 Xcel Energy Inc. All rights reserved.')).toBeInTheDocument();
    // One <xe-footer-column heading="…"> per heading + list pair; the column
    // wraps its <xe-hyperlink variant="variant"> links in <li>s.
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    const firstColumn = canvasElement.querySelector('xe-footer > xe-footer-column');
    await waitFor(() => expect(firstColumn.querySelectorAll(':scope > li > xe-hyperlink[variant="variant"]')).toHaveLength(4));
    // Icon-only social links are recognized by their labels.
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect([...canvasElement.querySelectorAll('xe-hyperlink[slot="legal"]')].every((l) => l.hasAttribute('trailing-icon'))).toBe(true);
    await expect(canvasElement.querySelector('xe-footer > img[slot="banner-image"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Our Energy, Your Power');
  },
};

// Nothing authored: the static logo and the default social / legal links, no
// columns, copyright or banner.
export const EmptyFooter = {
  args: {
    copyright: '', social: '', legal: '', footerlinks: '', banner_background: '', banner_tagline: '',
  },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expectStaticLogo(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(footer).not.toHaveAttribute('columns');
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
    await expect(legalLinks(canvasElement)).toEqual([
      ['Online Terms of Use', 'https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf'],
      ['Privacy', 'https://my.xcelenergy.com/s/privacy'],
      ['Accessibility', 'https://corporate.my.xcelenergy.com/s/about/accessibility'],
    ]);
    await expect(canvasElement.querySelector('[slot="banner-image"]')).toBeNull();
  },
};

// Blank fields don't shift the rest: with no copyright or social links, the
// legal links, columns and banner still land in place.
export const BlankFields = {
  args: { copyright: '', social: '', banner_tagline: 'Powering Tomorrow' },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[slot="copyright"]')).toBeNull();
    await expect(legalLinks(canvasElement)).toEqual(AUTHORED_LEGAL);
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
    await expect(canvasElement.querySelector('[slot="tagline"]')).toHaveTextContent('Powering Tomorrow');
  },
};

// Social links authored with EDS icons (:facebook: …) are recognized by the
// icon name.
export const EdsIconSocialLinks = {
  args: { social: SOCIAL_EDS_ICONS },
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(await socialLinks(canvasElement)).toEqual(EXPECTED_SOCIAL);
  },
};

// A heading without links yet renders no column; the others are unaffected.
export const HeadingWithoutLinks = {
  args: { footerlinks: `${FOOTER_LINKS}<p>Investors</p>` },
  play: async ({ canvasElement }) => {
    const footer = await upgraded(canvasElement);
    await expect(footer).toHaveAttribute('columns', '3');
    await expect(columnHeadings(canvasElement)).toEqual(['Company', 'Services', 'Support']);
  },
};

// Universal Editor: field instrumentation moves onto the elements rendered
// from it, so each field stays selectable.
export const EditorInstrumentation = {
  render: (args) => render(fieldsToRows(args), (block) => {
    const cells = [...block.children].map((row) => row.firstElementChild);
    const [copyrightRow, socialRow, legalRow, linksRow] = cells;
    copyrightRow.setAttribute('data-aue-prop', 'copyright');
    socialRow.setAttribute('data-aue-prop', 'social');
    legalRow.setAttribute('data-aue-prop', 'legal');
    linksRow.setAttribute('data-aue-prop', 'footerlinks');
    return decorate(block);
  }),
  play: async ({ canvasElement }) => {
    await upgraded(canvasElement);
    await expect(canvasElement.querySelector('[data-aue-prop="copyright"]').matches('span[slot="copyright"]')).toBe(true);
    await expect(canvasElement.querySelector('[data-aue-prop="social"]').matches('xe-icon-button[slot="social"]')).toBe(true);
    await expect(canvasElement.querySelector('[data-aue-prop="legal"]').matches('xe-hyperlink[slot="legal"]')).toBe(true);
    await expect(canvasElement.querySelector('[data-aue-prop="footerlinks"]').matches('xe-footer-column')).toBe(true);
  },
};
