import {
  buildBannerImage, buildCopyright, buildLogo, buildTagline, finishFooter, firstOf,
} from '../../scripts/components/xe-footer-utils.js';
import decorateColumnLinks from '../xe-footer-column-links/xe-footer-column-links.js';
import decorateSocialLinks, {
  decorateDefaults as defaultSocialLinks,
} from '../xe-footer-social-links/xe-footer-social-links.js';
import decorateLegalLinks, {
  decorateDefaults as defaultLegalLinks,
} from '../xe-footer-legal-links/xe-footer-legal-links.js';

/*
 * XE Footer V3
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer):
 *
 *   <xe-footer columns="5">
 *     <xe-logo slot="logo" variant="inverse" size="md" href="/" label="Xcel Energy Home"></xe-logo>
 *     <span slot="copyright">© 2026 Xcel Energy Inc. All rights reserved.</span>
 *     <xe-footer-column heading="Company">
 *       <xe-hyperlink href="…" variant="variant">Careers</xe-hyperlink>…
 *     </xe-footer-column>…
 *     <xe-icon-button slot="social" size="xl" …><xe-icon icon="…"></xe-icon></xe-icon-button>…
 *     <xe-hyperlink slot="legal" href="…" variant="variant" trailing-icon>…</xe-hyperlink>…
 *     <img slot="banner-image" src="…" alt="">
 *     <span slot="tagline">Our Energy, Your Power</span>
 *   </xe-footer>
 *
 * Unlike V2 (a container of child items), every field lives on the block
 * itself, in fixed slots (_xe-footer-v3.json). Element grouping renders each
 * group as one row, in model order, empty or not:
 *
 *   copyright                             → plain text
 *   social_cta1…5 (+ …Text network)       → up to 5 links, <a href="URL">network</a>
 *   legal_cta1…3 (+ …Text)                → up to 3 links
 *   column_heading1…5 + column_links1…5   → heading + rich-text link list pairs
 *   banner_background + banner_tagline    → <picture> + tagline
 *
 * The social, legal and column groups are decorated by the same functions as
 * V2's child items (xe-footer-social-links / -legal-links / -column-links),
 * since each just turns a container of links into footer elements. Slots left
 * empty (or with a network chosen but no URL) render nothing; with no social
 * or legal links at all, the live Xcel Energy footer's render.
 */

// The rows the model renders, in order (see the comment above).
const ROWS = ['copyright', 'social', 'legal', 'columns', 'banner'];

/** The element holding a row's authored content (its single cell). */
function cellOf(row) {
  return row.children.length === 1 ? row.firstElementChild : row;
}

export default async function decorate(block) {
  const fields = {};
  [...block.children].forEach((row, index) => {
    if (ROWS[index]) fields[ROWS[index]] = cellOf(row);
  });

  const footer = document.createElement('xe-footer');
  footer.append(buildLogo()); // static: the Xcel Energy logo, linking to the homepage
  if (fields.copyright && fields.copyright.textContent.trim()) {
    footer.append(buildCopyright(fields.copyright));
  }

  // --- Link columns (default slot): one per authored heading + list pair ---
  const columns = fields.columns ? decorateColumnLinks(fields.columns) : [];
  if (columns.length) footer.setAttribute('columns', String(columns.length));
  footer.append(...columns);

  // --- Social and legal links: the authored slots, else the defaults ---
  footer.append(
    ...firstOf(() => (fields.social ? decorateSocialLinks(fields.social) : []), defaultSocialLinks),
    ...firstOf(() => (fields.legal ? decorateLegalLinks(fields.legal) : []), defaultLegalLinks),
  );

  // --- Banner: background image + centered tagline ---
  if (fields.banner) {
    const tagline = [...fields.banner.childNodes].find((node) => node.textContent.trim());
    footer.append(...[buildBannerImage(fields.banner), buildTagline(tagline)].filter(Boolean));
  }

  await finishFooter(block, footer);
}
