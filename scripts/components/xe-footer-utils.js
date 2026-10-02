/*
 * Helpers shared by the XE Footer blocks (xe-footer-v2, xe-footer-v3) and the
 * link decorators they use (xe-footer-column-links, xe-footer-social-links,
 * xe-footer-legal-links).
 */

import { moveInstrumentation } from '../scripts.js';
import loadIgnite from './ignite.js';

// <xe-footer-column>'s accordion breakpoint (it hard-codes this media query).
const ACCORDION_QUERY = window.matchMedia('(max-width: 1024px)');

/**
 * An Ignite hyperlink styled for the dark footer, from an authored link or a
 * `[text, href]` default. `slot` / `trailingIcon` place it in the legal area.
 */
export function hyperlink(source, { slot, trailingIcon } = {}) {
  const link = document.createElement('xe-hyperlink');
  if (slot) link.setAttribute('slot', slot);
  link.setAttribute('variant', 'variant');
  if (trailingIcon) link.setAttribute('trailing-icon', '');
  if (Array.isArray(source)) {
    const [text, href] = source;
    link.setAttribute('href', href);
    link.textContent = text;
    return link;
  }
  link.setAttribute('href', source.getAttribute('href') || '');
  ['target', 'aria-label'].forEach((name) => {
    if (source.hasAttribute(name)) link.setAttribute(name, source.getAttribute(name));
  });
  link.textContent = source.textContent.trim();
  moveInstrumentation(source, link);
  return link;
}

/**
 * Keeps a source's Universal Editor instrumentation in the rendered footer by
 * moving it onto the first element built from it, so the item or field stays
 * in the editor's content tree and can be selected. A child item with nothing
 * to render yet (just added, no links) gets an editor-only placeholder in
 * `slot` (or the default slot when `slot` is null) instead of disappearing;
 * on published pages there is no instrumentation, so nothing is added.
 * @returns {Element[]} the elements to slot into the footer
 */
export function keepInstrumentation(source, elements, slot, placeholderText) {
  if (elements.length) {
    moveInstrumentation(source, elements[0]);
    return elements;
  }
  if (!source.hasAttribute('data-aue-resource')) return elements;
  const placeholder = document.createElement('span');
  if (slot) placeholder.setAttribute('slot', slot);
  placeholder.className = 'xe-footer-v2-placeholder';
  placeholder.textContent = placeholderText;
  moveInstrumentation(source, placeholder);
  return [placeholder];
}

/**
 * The first non-empty result of `sources`, tried in order: e.g. the authored
 * links, then an older footer's field, then defaults.
 */
export function firstOf(...sources) {
  return sources.map((source) => source()).find((elements) => elements.length) || [];
}

/**
 * The footer logo: Ignite's built-in Xcel Energy logo, linking to the
 * homepage. It isn't authorable.
 */
export function buildLogo() {
  const logo = document.createElement('xe-logo');
  logo.setAttribute('slot', 'logo');
  logo.setAttribute('variant', 'inverse');
  logo.setAttribute('size', 'md');
  logo.setAttribute('href', '/');
  logo.setAttribute('label', 'Xcel Energy Home');
  return logo;
}

/**
 * The copyright (a plain-text field) as a slotted <span>. The field's
 * instrumentation may sit on the cell or on the <p> inside it; both move.
 */
export function buildCopyright(value) {
  const span = document.createElement('span');
  span.setAttribute('slot', 'copyright');
  moveInstrumentation(value, span);
  if (value.children.length === 1) moveInstrumentation(value.firstElementChild, span);
  span.textContent = value.textContent.trim();
  return span;
}

/**
 * The banner as a bare slotted <img> (the component styles `::slotted(img)`),
 * or null when `value` holds no image. The authored <picture>'s responsive
 * sources are folded into the image's srcset (widths from their `width=`
 * parameter) so the full-bleed banner doesn't fall back to the small default
 * rendition.
 */
export function buildBannerImage(value) {
  const img = value.querySelector('img');
  if (!img) return null;
  const candidates = [...value.querySelectorAll('source')]
    .filter((source) => !source.type || source.type === 'image/webp')
    .map((source) => {
      const url = source.getAttribute('srcset') || '';
      const width = url.match(/[?&]width=(\d+)/);
      return width ? `${url} ${width[1]}w` : null;
    })
    .filter(Boolean);
  if (candidates.length) {
    img.setAttribute('srcset', [...new Set(candidates)].join(', '));
    img.setAttribute('sizes', '100vw');
  }
  img.setAttribute('slot', 'banner-image');
  img.setAttribute('alt', '');
  img.setAttribute('loading', 'lazy');
  moveInstrumentation(value, img);
  return img;
}

/** The banner tagline as a slotted <span>, or null when `source` has no text. */
export function buildTagline(source) {
  const text = source && source.textContent.trim();
  if (!text) return null;
  const tagline = document.createElement('span');
  tagline.setAttribute('slot', 'tagline');
  tagline.textContent = text;
  if (source.nodeType === Node.ELEMENT_NODE) moveInstrumentation(source, tagline);
  return tagline;
}

/**
 * Keeps the column <li>s valid in both layouts. On desktop <xe-footer-column>
 * slots them into a <ul>, but its accordion (mobile) layout slots them without
 * one, which leaves orphaned list items (WCAG 1.3.1, axe `listitem`). Drop
 * their list semantics while the accordion layout is active.
 */
function syncListSemantics(footer) {
  footer.querySelectorAll('xe-footer-column > li').forEach((item) => {
    if (ACCORDION_QUERY.matches) item.setAttribute('role', 'none');
    else item.removeAttribute('role');
  });
}

/**
 * Puts the built <xe-footer> in place of the block's authored rows, keeps the
 * columns' list semantics in step with the layout, and waits for the Ignite
 * components to register so the section reveals the styled footer rather
 * than its unstyled light DOM.
 */
export async function finishFooter(block, footer) {
  block.textContent = '';
  block.append(footer);

  // <xe-footer-column> wraps its links in <li>s once it renders; keep their
  // list semantics in step with the layout as they appear and as it changes.
  new MutationObserver(() => syncListSemantics(footer))
    .observe(footer, { childList: true, subtree: true });
  ACCORDION_QUERY.addEventListener('change', () => syncListSemantics(footer));

  await loadIgnite(() => Promise.all([
    import('../ignite/bundle/compositions/footer/xe-footer.js'),
    import('../ignite/bundle/primitives/action/icon-button/xe-icon-button.js'),
  ]));
}
