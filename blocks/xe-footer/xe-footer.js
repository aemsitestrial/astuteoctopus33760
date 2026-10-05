import {
  buildBannerImage, buildCopyright, buildLogo, buildTagline, finishFooter, firstOf, readFieldRows,
} from '../../scripts/components/xe-footer-utils.js';
import decorateColumnLinks from '../xe-footer-column-links/xe-footer-column-links.js';
import decorateSocialLinks, {
  decorateDefaults as defaultSocialLinks,
} from '../xe-footer-social-links/xe-footer-social-links.js';
import decorateLegalLinks, {
  decorateDefaults as defaultLegalLinks,
} from '../xe-footer-legal-links/xe-footer-legal-links.js';

/*
 * XE Footer
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer) — the same markup as XE Footer
 * V2 and V3:
 *
 *   <xe-footer columns="3">
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
 * The model (_xe-footer.json) renders one row per field or element group, in
 * model order, empty or not:
 *
 *   social                               → rich-text social links (icons or text)
 *   legal                                → rich-text legal links
 *   footerlinks                          → rich-text heading + link list pairs
 *   banner_background + banner_tagline   → <picture> + tagline
 *
 * The rich-text links are decorated by the same functions as XE Footer V2's
 * child items (xe-footer-social-links / -legal-links / -column-links), which
 * turn a container of links into footer elements. With no social or legal
 * links at all, the live Xcel Energy footer's render. The logo and the
 * copyright ("© <current year> Xcel Energy Inc. All rights reserved.") are
 * static, not authorable.
 */

// The rows the model renders, in order (see the comment above).
const ROWS = ['social', 'legal', 'columns', 'banner'];

export default async function decorate(block) {
  const fields = readFieldRows(block, ROWS);

  const footer = document.createElement('xe-footer');
  footer.append(buildLogo());
  footer.append(buildCopyright()); // static, with the current year

  // --- Link columns (default slot): one per heading + list pair ---
  const columns = fields.columns ? decorateColumnLinks(fields.columns) : [];
  if (columns.length) footer.setAttribute('columns', 5);
  footer.append(...columns);

  // --- Social and legal links: the authored rich text, else the defaults ---
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
