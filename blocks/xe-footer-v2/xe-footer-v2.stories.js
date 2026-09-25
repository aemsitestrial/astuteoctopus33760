/*
 * Storybook stories for the XE Footer block.
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
import { expect, within } from 'storybook/test';
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
 * what AEM renders for this block. Empty fields are omitted so the decorator
 * sees the same shape it would for an author who left a field blank.
 */
function fieldsToRows(args) {
  const rows = [];
  if (args.logo) rows.push([picture(args.logo, args.logoAlt)]);
  if (args.copyright) rows.push([args.copyright]);
  if (args.social) rows.push([args.social]);
  if (args.legal) rows.push([args.legal]);
  if (args.footerlinks) rows.push([args.footerlinks]);
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
          'Recreates the Xcel footer: a dark maroon content zone (brand column '
          + '+ link columns) above a full-bleed banner with a centered tagline. '
          + 'Controls map one-to-one to the block\'s authoring model, so this '
          + 'page mirrors Universal Editor authoring.',
      },
    },
  },
};

// The complete footer as authored on the site.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Brand, link columns, and banner all render.
    await expect(canvasElement.querySelector('.xe-footer-v2')).toBeInTheDocument();
    await expect(canvas.getByText('Company')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.xe-footer-v2-links-col')).toHaveLength(3);
    await expect(canvas.getByText('Our Energy, Your Power')).toBeInTheDocument();
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
    await expect(canvasElement.querySelectorAll('.xe-footer-v2-links-col')).toHaveLength(1);
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
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('.xe-footer-v2-links-col')).toHaveLength(2);
    await expect(canvas.getByText('Powering Tomorrow')).toBeInTheDocument();
  },
};
