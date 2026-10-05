import {
  buildBannerImage, buildCopyright, buildLogo, buildTagline, finishFooter, firstOf, readFieldRows,
} from '../../scripts/components/xe-footer-utils.js';
import fetchQueryIndex from '../../scripts/components/query-index.js';
import { decoratePathColumns } from '../xe-footer-column-links/xe-footer-column-links.js';
import decorateSocialLinks, {
  decorateDefaults as defaultSocialLinks,
} from '../xe-footer-social-links/xe-footer-social-links.js';
import decorateLegalLinks, {
  decorateDefaults as defaultLegalLinks,
} from '../xe-footer-legal-links/xe-footer-legal-links.js';

/*
 * XE Footer V4
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
 * Every field lives on the block itself, in fixed slots (_xe-footer-v4.json).
 * Element grouping renders each group as one row, in model order, empty or
 * not:
 *
 *   social_cta1…5 (+ …Text network)       → up to 5 links, <a href="URL">network</a>
 *   legal_cta1…3 (+ …Text)                → up to 3 links
 *   column_heading1…5 + column_links1…5   → heading + page path pairs
 *   banner_background + banner_tagline    → <picture> + tagline
 *
 * Each link column lists the child pages of its configured path, from the
 * query index (/query-index.json): one link per published page directly under
 * the path, labelled with the page's title (when the index has a `title`
 * property) or a label from its URL. A path with no child pages in the index
 * shows a single link to the path itself.
 *
 * The social, legal and column groups are decorated by the functions of V2's
 * child items (xe-footer-social-links / -legal-links / -column-links). Slots left
 * empty (or with a network chosen but no URL) render nothing; with no social
 * or legal links at all, the live Xcel Energy footer's render. The logo and
 * the copyright ("© <current year> Xcel Energy Inc. All rights reserved.")
 * are static, not authorable.
 */

// The rows the model renders, in order (see the comment above).
const ROWS = ['social', 'legal', 'columns', 'banner'];

export default async function decorate(block) {
  const fields = readFieldRows(block, ROWS);

  const footer = document.createElement('xe-footer');
  footer.append(buildLogo()); // static: the Xcel Energy logo, linking to the homepage
  footer.append(buildCopyright()); // static, with the current year

  // --- Link columns (default slot): one per heading + path, listing the
  // path's child pages from the query index ---
  const hasPaths = fields.columns && fields.columns.querySelector('a');
  const columns = hasPaths ? decoratePathColumns(fields.columns, await fetchQueryIndex()) : [];
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
