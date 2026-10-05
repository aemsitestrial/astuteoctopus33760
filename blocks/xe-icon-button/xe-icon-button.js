import loadIgnite from '../../scripts/components/ignite.js';
import {
  createPrimitive, ICON_OPTIONS, propsFromClasses, readLinkContent, renderPrimitive,
} from '../../scripts/components/primitives.js';

/*
 * XE Icon Button — primitive block for the @ignite/web icon button
 * (scripts/ignite/bundle/primitives/action/icon-button):
 *
 *   <xe-icon-button treatment="outlined" size="lg" href="…" aria-label="Facebook">
 *     <xe-icon icon="faSquareFacebook" size="lg"></xe-icon>
 *   </xe-icon-button>
 *
 * Authored on its own (a block in a section), or built by other blocks — the
 * same props either way:
 *
 *   import { buildIconButton, loadIconButton } from '../xe-icon-button/xe-icon-button.js';
 *   const button = buildIconButton({
 *     icon: 'faSquareFacebook', href: 'https://www.facebook.com/XcelEnergy',
 *     target: '_blank', ariaLabel: 'Facebook (opens in a new window)',
 *   });
 *   loadIconButton();
 *
 * ICON_BUTTON_PROPS lists every prop the Ignite icon button takes (see
 * scripts/components/primitives.js for the schema); `icon` and `iconSize`
 * set the <xe-icon> it holds. The button is a 48px target whatever its size;
 * the glyph's size is the icon's. An icon button has no visible text, so it
 * needs an accessible label: without one, the icon's name is used.
 *
 * The model (_xe-icon-button.json) renders two rows — the link (Link URL) and
 * the accessible label — and the options as block classes (classes_*):
 * icon-…, treatment-…, size-… (the button's and the icon's), target-new-window,
 * disabled.
 */

const SIZES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/** Every prop of the Ignite <xe-icon-button> (see scripts/components/primitives.js). */
export const ICON_BUTTON_PROPS = {
  treatment: { values: ['default', 'filled', 'outlined'], aliases: { outline: 'outlined' }, option: 'treatment' },
  size: { values: SIZES, option: 'size' },
  href: {},
  target: {
    values: ['_blank', '_self', '_parent', '_top'],
    option: 'target',
    optionValues: { 'new-window': '_blank' },
  },
  disabled: { type: 'boolean', option: 'disabled' },
  ariaLabel: {},
};

// The <xe-icon> inside: its glyph and size.
const ICON_PROPS = {
  icon: { option: 'icon', optionValues: ICON_OPTIONS },
  size: { values: SIZES },
};

/** A readable label from an icon name: faSquareFacebook → "Facebook". */
function iconLabel(icon) {
  return icon.replace(/^fa(Square)?/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Builds an Ignite <xe-icon-button>.
 * @param {object} props `icon` (an icon name, scripts/components/icons.js) and
 *   `iconSize` plus any of ICON_BUTTON_PROPS, e.g.
 *   `{ icon: 'faHouse', href: '/', ariaLabel: 'Home', treatment: 'filled' }`
 * @returns {HTMLElement} the <xe-icon-button> (call loadIconButton() to render it)
 */
export function buildIconButton({ icon, iconSize, ...props } = {}) {
  const ariaLabel = props.ariaLabel || (icon ? iconLabel(icon) : '');
  const button = createPrimitive('xe-icon-button', { ...props, ariaLabel }, ICON_BUTTON_PROPS);
  if (icon) button.append(createPrimitive('xe-icon', { icon, size: iconSize }, ICON_PROPS));
  return button;
}

/** Loads (once) and registers the Ignite icon button; resolves null on failure. */
export function loadIconButton() {
  return loadIgnite(() => import('../../scripts/ignite/bundle/primitives/action/icon-button/xe-icon-button.js'));
}

export default async function decorate(block) {
  const { anchor, href, ariaLabel } = readLinkContent(block);
  const props = propsFromClasses(block, ICON_BUTTON_PROPS);
  const { icon } = propsFromClasses(block, ICON_PROPS);
  // One authored size, for the button and its icon.
  const button = icon && buildIconButton({
    ...props, icon, iconSize: props.size, href, ariaLabel,
  });
  renderPrimitive(block, button || null, {
    source: anchor, placeholder: 'Choose an icon and add an accessible label',
  });
  await loadIconButton();
}
