import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';
import {
  createPrimitive, isEditing, propsFromClasses, readRows,
} from '../../scripts/components/primitives.js';

/*
 * XE Button — primitive block for the @ignite/web button
 * (scripts/ignite/bundle/primitives/action/button):
 *
 *   <xe-button variant="primary" treatment="filled" size="md" href="…"
 *              trailing-icon="faArrowRight">Explore Programs</xe-button>
 *
 * Authored on its own (a block in a section), or built by other blocks for
 * their CTAs — the same props either way:
 *
 *   import { buildButton, loadButton } from '../xe-button/xe-button.js';
 *   const button = buildButton({
 *     label: 'Explore Programs', href: '/programs',
 *     variant: 'primary', treatment: 'outlined', size: 'sm', trailingIcon: 'faArrowRight',
 *   });
 *   button.slot = 'action';
 *   loadButton();
 *
 * BUTTON_PROPS lists every prop the Ignite button takes (see
 * scripts/components/primitives.js for the schema). Without a prop, the
 * button's default applies: primary, filled, md. The button renders a link
 * when it has an href (and isn't disabled), else a <button>.
 *
 * The model (_xe-button.json) renders two rows — the link (Link URL + Label
 * collapse into one <a>) and the accessible label — and the style options as
 * block classes (classes_*): variant-…, treatment-…, size-…, size-mobile-…,
 * leading-icon-…, trailing-icon-…, target-new-window, expand, disabled.
 */

const VARIANTS = ['primary', 'secondary', 'tertiary', 'accent', 'neutral', 'static-dark', 'static-light'];
const TREATMENTS = ['filled', 'outlined', 'text'];
const SIZES = ['xxs', 'xs', 'sm', 'md', 'lg'];

// Icon option class suffixes → icon names (scripts/components/icons.js).
const ICONS = {
  'arrow-right': 'faArrowRight',
  'arrow-up-right-from-square': 'faArrowUpRightFromSquare',
  'chevron-right': 'faChevronRight',
  bolt: 'faBolt',
  house: 'faHouse',
  leaf: 'faLeaf',
  lightbulb: 'faLightbulb',
  'piggy-bank': 'faPiggyBank',
};

/** Every prop of the Ignite <xe-button> (see scripts/components/primitives.js). */
export const BUTTON_PROPS = {
  variant: { values: VARIANTS, option: 'variant' },
  treatment: { values: TREATMENTS, aliases: { outline: 'outlined' }, option: 'treatment' },
  size: { values: SIZES, option: 'size' },
  sizeMobile: { values: SIZES, option: 'size-mobile' }, // below 768px
  href: {},
  target: {
    values: ['_blank', '_self', '_parent', '_top'],
    option: 'target',
    optionValues: { 'new-window': '_blank' },
  },
  type: { values: ['button', 'submit', 'reset'] }, // without an href
  leadingIcon: { option: 'leading-icon', optionValues: ICONS },
  trailingIcon: { option: 'trailing-icon', optionValues: ICONS },
  disabled: { type: 'boolean', option: 'disabled' },
  expand: { type: 'boolean', option: 'expand' }, // full width
  ariaLabel: {},
  ariaHaspopup: { values: ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'] },
  ariaExpanded: { values: ['true', 'false'] },
};

/**
 * Builds an Ignite <xe-button>.
 * @param {object} props `label` (text or nodes) plus any of BUTTON_PROPS, e.g.
 *   `{ label: 'Pay bill', href: '/pay', variant: 'secondary', trailingIcon: 'faArrowRight' }`
 * @returns {HTMLElement} the <xe-button> (call loadButton() to render it)
 */
export function buildButton({ label, ...props } = {}) {
  const button = createPrimitive('xe-button', props, BUTTON_PROPS);
  if (label) button.append(...[label].flat());
  return button;
}

/** Loads (once) and registers the Ignite button; resolves null on failure. */
export function loadButton() {
  return loadIgnite(() => import('../../scripts/ignite/bundle/primitives/action/button/xe-button.js'));
}

export default async function decorate(block) {
  const rows = readRows(block, ['link', 'ariaLabel']);
  const anchor = rows.link && rows.link.querySelector('a');
  const label = anchor ? anchor.textContent.trim() : '';

  block.textContent = '';
  if (label) {
    const button = buildButton({
      ...propsFromClasses(block, BUTTON_PROPS),
      label,
      href: anchor.getAttribute('href'),
      ariaLabel: rows.ariaLabel && rows.ariaLabel.textContent,
    });
    moveInstrumentation(anchor, button);
    block.append(button);
  } else if (isEditing(block)) {
    // Universal Editor: keep an empty block visible and selectable.
    const placeholder = document.createElement('p');
    placeholder.className = 'xe-button-placeholder';
    placeholder.textContent = 'Add a button label and link';
    block.append(placeholder);
  }

  await loadButton();
}
