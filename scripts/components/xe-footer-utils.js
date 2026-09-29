/*
 * Helpers shared by the XE Footer V2 block and its child item blocks
 * (xe-footer-social-links, xe-footer-legal-links).
 */

import { moveInstrumentation } from '../scripts.js';

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
 * `slot` instead of disappearing; on published pages there is no
 * instrumentation, so nothing is added.
 * @returns {Element[]} the elements to slot into the footer
 */
export function keepInstrumentation(source, elements, slot, placeholderText) {
  if (elements.length) {
    moveInstrumentation(source, elements[0]);
    return elements;
  }
  if (!source.hasAttribute('data-aue-resource')) return elements;
  const placeholder = document.createElement('span');
  placeholder.setAttribute('slot', slot);
  placeholder.className = 'xe-footer-v2-placeholder';
  placeholder.textContent = placeholderText;
  moveInstrumentation(source, placeholder);
  return [placeholder];
}
