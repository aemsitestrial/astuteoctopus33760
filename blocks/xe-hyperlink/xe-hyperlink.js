import loadIgnite from '../../scripts/components/ignite.js';
import {
  createPrimitive, propsFromClasses, readLinkContent, renderPrimitive,
} from '../../scripts/components/primitives.js';

/*
 * XE Hyperlink — primitive block for the @ignite/web hyperlink
 * (scripts/ignite/bundle/primitives/action/hyperlink):
 *
 *   <xe-hyperlink href="…" variant="variant" trailing-icon link-type="internal">
 *     Privacy
 *   </xe-hyperlink>
 *
 * Authored on its own (a block in a section), or built by other blocks — the
 * same props either way:
 *
 *   import { buildHyperlink, loadHyperlink } from '../xe-hyperlink/xe-hyperlink.js';
 *   const link = buildHyperlink({ label: 'Privacy', href: '/privacy', variant: 'variant' });
 *   loadHyperlink();
 *
 * HYPERLINK_PROPS lists every prop the Ignite hyperlink takes (see
 * scripts/components/primitives.js for the schema). `variant="variant"` is the
 * light text for dark backgrounds (the footer's); `trailing-icon` adds an icon
 * after the label — an outbound arrow for `link-type="external"` (the
 * default), a chevron for `internal`.
 *
 * The model (_xe-hyperlink.json) renders two rows — the link (Link URL + Label
 * collapse into one <a>) and the accessible label — and the style options as
 * block classes (classes_*): variant-variant, link-type-…, target-new-window,
 * trailing-icon.
 */

/** Every prop of the Ignite <xe-hyperlink> (see scripts/components/primitives.js). */
export const HYPERLINK_PROPS = {
  href: {},
  target: {
    values: ['_blank', '_self', '_parent', '_top'],
    option: 'target',
    optionValues: { 'new-window': '_blank' },
  },
  ariaLabel: {},
  variant: { values: ['default', 'variant'], option: 'variant' }, // variant: light, on dark
  trailingIcon: { type: 'boolean', option: 'trailing-icon' },
  linkType: { values: ['external', 'internal'], option: 'link-type' }, // the trailing icon
};

/**
 * Builds an Ignite <xe-hyperlink>.
 * @param {object} props `label` (text or nodes) plus any of HYPERLINK_PROPS, e.g.
 *   `{ label: 'Privacy', href: '/privacy', variant: 'variant', trailingIcon: true }`
 * @returns {HTMLElement} the <xe-hyperlink> (call loadHyperlink() to render it)
 */
export function buildHyperlink({ label, ...props } = {}) {
  const link = createPrimitive('xe-hyperlink', props, HYPERLINK_PROPS);
  if (label) link.append(...[label].flat());
  return link;
}

/** Loads (once) and registers the Ignite hyperlink; resolves null on failure. */
export function loadHyperlink() {
  return loadIgnite(() => import('../../scripts/ignite/bundle/primitives/action/hyperlink/xe-hyperlink.js'));
}

export default async function decorate(block) {
  const {
    anchor, label, href, ariaLabel,
  } = readLinkContent(block);
  const link = label && buildHyperlink({
    ...propsFromClasses(block, HYPERLINK_PROPS), label, href, ariaLabel,
  });
  renderPrimitive(block, link || null, {
    source: anchor, placeholder: 'Add a link label and URL',
  });
  await loadHyperlink();
}
