import { hyperlink, keepInstrumentation } from '../../scripts/components/xe-footer-utils.js';

/*
 * XE Footer Legal Links — child item of XE Footer V2 holding the legal links.
 *
 * The item has one rich-text field, a bulleted list of links typed in the
 * editor. decorate(item) turns each link into the footer's legal link, which
 * XE Footer V2 slots straight into <xe-footer>:
 *
 *   <xe-hyperlink slot="legal" href="…" variant="variant" trailing-icon>Privacy</xe-hyperlink>
 *
 * The item's Universal Editor instrumentation moves onto the first link (or
 * an editor-only placeholder while the item has no links yet). The links are
 * a rich-text list rather than a multi-field: multi-fields are an early-access
 * feature and render empty unless Adobe enables them for the program.
 */

// Rendered when no legal links are authored (the live Xcel Energy footer's).
const DEFAULT_LEGAL_LINKS = [
  ['Online Terms of Use', 'https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf'],
  ['Privacy', 'https://my.xcelenergy.com/s/privacy'],
  ['Accessibility', 'https://corporate.my.xcelenergy.com/s/about/accessibility'],
];

const LEGAL = { slot: 'legal', trailingIcon: true };

/** The live Xcel Energy footer's legal links. */
export function decorateDefaults() {
  return DEFAULT_LEGAL_LINKS.map((link) => hyperlink(link, LEGAL));
}

/**
 * Builds the legal links for an item row (or any element holding links, such
 * as a legacy rich-text field).
 * @param {Element} item the authored item row
 * @returns {Element[]} the elements to slot into <xe-footer>
 */
export default function decorate(item) {
  const links = [...item.querySelectorAll('a')].map((anchor) => hyperlink(anchor, LEGAL));
  return keepInstrumentation(item, links, 'legal', 'Add legal links');
}
