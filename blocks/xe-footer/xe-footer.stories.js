/*
 * Storybook stories for the XE Footer block.
 *
 * The block's decorate() classifies authored rows by position/structure, so a
 * story just needs to supply the rows an author would create, in model order:
 *
 *   0. logo        (image)
 *   1. copyright   (rich text)
 *   2. social      (rich text: social icon links)
 *   3. legal       (rich text: legal links)
 *   4. footerlinks (rich text: heading + link-list pairs -> columns)
 *   ...then the banner (the last image-bearing row) with its tagline.
 *
 * renderBlock() wraps these in the real EDS section/wrapper/block chain, loads
 * the shipped xe-footer.css, and runs decorate() — so what you see here matches
 * production rendering.
 */
import decorate from './xe-footer.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

const logoRow = picture('/icons/xcel-logo-white.svg', 'Xcel');

const copyrightRow = '<p>© 2026 Xcel Energy. All rights reserved.</p>';

const socialRow = `<p>
  <a href="#" aria-label="Facebook">${picture('/icons/facebook.svg', 'Facebook')}</a>
  <a href="#" aria-label="X">${picture('/icons/x.svg', 'X')}</a>
  <a href="#" aria-label="Instagram">${picture('/icons/instagram.svg', 'Instagram')}</a>
  <a href="#" aria-label="LinkedIn">${picture('/icons/linkedin.svg', 'LinkedIn')}</a>
  <a href="#" aria-label="YouTube">${picture('/icons/youtube.svg', 'YouTube')}</a>
</p>`;

const legalRow = `<ul>
  <li><a href="#">Privacy Policy</a></li>
  <li><a href="#">Terms of Use</a></li>
  <li><a href="#">Cookie Preferences</a></li>
</ul>`;

const footerLinksRow = `
  <p>Company</p>
  <ul>
    <li><a href="#">About us</a></li>
    <li><a href="#">Careers</a></li>
    <li><a href="#">Newsroom</a></li>
    <li><a href="#">Sustainability</a></li>
  </ul>
  <p>Services</p>
  <ul>
    <li><a href="#">Residential</a></li>
    <li><a href="#">Business</a></li>
    <li><a href="#">Renewable plans</a></li>
    <li><a href="#">Usage insights</a></li>
  </ul>
  <p>Support</p>
  <ul>
    <li><a href="#">Contact us</a></li>
    <li><a href="#">Help center</a></li>
    <li><a href="#">Report an outage</a></li>
    <li><a href="#">Billing &amp; payments</a></li>
  </ul>
`;

const bannerRow = `${picture('https://picsum.photos/1600/400?grayscale', 'Solar panels')}<p>Our Energy, Your Power</p>`;

const fullRows = [
  [logoRow],
  [copyrightRow],
  [socialRow],
  [legalRow],
  [footerLinksRow],
  [bannerRow],
];

export default {
  title: 'Blocks/XE Footer',
  // Each story renders through the real EDS harness + block decorator.
  render: (args) => renderBlock({ name: 'xe-footer', rows: args.rows, decorate }),
  parameters: {
    layout: 'fullscreen',
  },
};

// The complete footer as authored on the site: brand column, link columns, and
// the full-bleed banner with a centered tagline.
export const Default = {
  args: { rows: fullRows },
};

// A single link column, exercising the desktop grid with one track. The banner
// is always present — the block's model ships banner fields, and its decorator
// treats the last image-bearing row as the banner, so every realistic authored
// footer includes one.
export const SingleLinkColumn = {
  args: {
    rows: [
      [logoRow],
      [copyrightRow],
      [socialRow],
      [legalRow],
      [`<p>Company</p>
        <ul>
          <li><a href="#">About us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Newsroom</a></li>
        </ul>`],
      [bannerRow],
    ],
  },
};

// Two link columns with a shorter tagline — a common real-world configuration.
export const TwoLinkColumns = {
  args: {
    rows: [
      [logoRow],
      [copyrightRow],
      [socialRow],
      [legalRow],
      [`<p>Company</p>
        <ul>
          <li><a href="#">About us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Newsroom</a></li>
        </ul>
        <p>Support</p>
        <ul>
          <li><a href="#">Contact us</a></li>
          <li><a href="#">Help center</a></li>
          <li><a href="#">Report an outage</a></li>
        </ul>`],
      [`${picture('https://picsum.photos/1600/400?grayscale', 'Solar panels')}<p>Powering Tomorrow</p>`],
    ],
  },
};
