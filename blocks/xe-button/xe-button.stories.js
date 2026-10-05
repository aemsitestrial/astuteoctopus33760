/*
 * Storybook stories for the XE Button primitive block (@ignite/web button).
 *
 * Controls mirror the block's authoring model (blocks/xe-button/_xe-button.json),
 * so editing a control is like editing the field in the Universal Editor:
 *
 *   cta_link + cta_linkText  aem-content + text -> "link" + "label" (one <a>)
 *   ariaLabel                text               -> "ariaLabel"
 *   classes_variant …        selects            -> "variant", "treatment", "size",
 *                                                  "sizeMobile", "leadingIcon",
 *                                                  "trailingIcon", "target"
 *   classes                  multiselect        -> "expand", "disabled"
 *
 * The select fields render as block classes (variant-secondary, size-lg, …);
 * `toVariants` builds them from the args. The Gallery and BuildButton stories
 * use the exported buildButton() directly, as other blocks do.
 */
import { expect, waitFor } from 'storybook/test';
import decorate, { buildButton, loadButton } from './xe-button.js';
import { renderBlock } from '../../.storybook/eds.js';

const defaults = {
  link: '#programs',
  label: 'Explore Programs',
  ariaLabel: '',
  variant: '',
  treatment: '',
  size: '',
  sizeMobile: '',
  leadingIcon: '',
  trailingIcon: '',
  target: '',
  expand: false,
  disabled: false,
};

/** The two rows AEM renders: the link (Link URL + Label) and the accessible label. */
const fieldsToRows = (args) => [
  [args.label ? `<p><a href="${args.link}">${args.label}</a></p>` : ''],
  [args.ariaLabel ? `<p>${args.ariaLabel}</p>` : ''],
];

/** The block classes the classes_* fields render. */
function toVariants(args) {
  return [
    args.variant && `variant-${args.variant}`,
    args.treatment && `treatment-${args.treatment}`,
    args.size && `size-${args.size}`,
    args.sizeMobile && `size-mobile-${args.sizeMobile}`,
    args.leadingIcon && `leading-icon-${args.leadingIcon}`,
    args.trailingIcon && `trailing-icon-${args.trailingIcon}`,
    args.target && `target-${args.target}`,
    args.expand && 'expand',
    args.disabled && 'disabled',
  ].filter(Boolean);
}

const select = (options, description, category = 'Style') => ({
  control: 'select', options: ['', ...options], description, table: { category },
});
const SIZES = ['xxs', 'xs', 'sm', 'md', 'lg'];
const ICONS = ['arrow-right', 'arrow-up-right-from-square', 'chevron-right', 'bolt', 'house', 'leaf', 'lightbulb', 'piggy-bank'];

const argTypes = {
  link: { control: 'text', description: 'Link URL (aem-content).', table: { category: 'Content' } },
  label: { control: 'text', description: 'Label (text).', table: { category: 'Content' } },
  ariaLabel: { control: 'text', description: 'Accessible Label (text) — read by screen readers instead of the label.', table: { category: 'Content' } },
  variant: select(['primary', 'secondary', 'tertiary', 'accent', 'neutral', 'static-dark', 'static-light'], 'Variant (classes_variant). Default: primary.'),
  treatment: select(['filled', 'outlined', 'text'], 'Treatment (classes_treatment). Default: filled.'),
  size: select(SIZES, 'Size (classes_size). Default: md.'),
  sizeMobile: select(SIZES, 'Mobile Size (classes_sizeMobile) — below 768px.'),
  leadingIcon: select(ICONS, 'Leading Icon (classes_leadingIcon).', 'Icons'),
  trailingIcon: select(ICONS, 'Trailing Icon (classes_trailingIcon).', 'Icons'),
  target: select(['new-window'], 'Open In (classes_target).', 'Behavior'),
  expand: { control: 'boolean', description: 'Options › Full Width (classes).', table: { category: 'Behavior' } },
  disabled: { control: 'boolean', description: 'Options › Disabled (classes).', table: { category: 'Behavior' } },
};

const render = (args) => renderBlock({
  name: 'xe-button', rows: fieldsToRows(args), decorate, variants: toVariants(args),
});

export default {
  title: 'Blocks/XE Button',
  argTypes,
  args: defaults,
  render,
  parameters: {
    docs: {
      description: {
        component:
          'A primitive block for the @ignite/web <xe-button>. Every prop of the '
          + 'Ignite button is available, both to authors (the model) and to other '
          + 'blocks through buildButton().',
      },
    },
  },
};

/** Waits for the button to upgrade and returns its shadow-DOM link or button. */
async function upgraded(button) {
  await waitFor(() => expect(button.shadowRoot?.querySelector('a, button')).toBeTruthy(), { timeout: 8000 });
  return button.shadowRoot.querySelector('a, button');
}

// The defaults: primary, filled, medium, linking to its URL.
export const Default = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('.xe-button > xe-button');
    await expect(button).toHaveTextContent('Explore Programs');
    await expect(button).toHaveAttribute('href', '#programs');
    await expect(button).not.toHaveAttribute('variant');
    const anchor = await upgraded(button);
    await expect(anchor.tagName).toBe('A');
    await expect(anchor).toHaveAttribute('href', '#programs');
    await expect(anchor.classList.contains('primary') && anchor.classList.contains('filled') && anchor.classList.contains('md')).toBe(true);
  },
};

// Every style option set from the block classes.
export const Styled = {
  args: {
    variant: 'secondary', treatment: 'outlined', size: 'lg', sizeMobile: 'sm', trailingIcon: 'arrow-right',
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('xe-button');
    await expect(button).toHaveAttribute('variant', 'secondary');
    await expect(button).toHaveAttribute('treatment', 'outlined');
    await expect(button).toHaveAttribute('size', 'lg');
    await expect(button).toHaveAttribute('size-mobile', 'sm');
    await expect(button).toHaveAttribute('trailing-icon', 'faArrowRight');
    const anchor = await upgraded(button);
    await expect(anchor.classList.contains('secondary') && anchor.classList.contains('outlined')).toBe(true);
    await expect(anchor.querySelector('.trailing-icon xe-icon')).toHaveAttribute('icon', 'faArrowRight');
  },
};

// Leading and trailing icons.
export const WithIcons = {
  args: { leadingIcon: 'lightbulb', trailingIcon: 'chevron-right' },
  play: async ({ canvasElement }) => {
    const anchor = await upgraded(canvasElement.querySelector('xe-button'));
    await expect(anchor.querySelector('.icon xe-icon')).toHaveAttribute('icon', 'faLightbulb');
    await expect(anchor.querySelector('.trailing-icon xe-icon')).toHaveAttribute('icon', 'faChevronRight');
  },
};

// Opens in a new window, with an accessible label for screen readers.
export const NewWindow = {
  args: {
    label: 'Pay Bill', link: 'https://my.xcelenergy.com', target: 'new-window', trailingIcon: 'arrow-up-right-from-square', ariaLabel: 'Pay Bill (opens in a new window)',
  },
  play: async ({ canvasElement }) => {
    const anchor = await upgraded(canvasElement.querySelector('xe-button'));
    await expect(anchor).toHaveAttribute('target', '_blank');
    await expect(anchor).toHaveAttribute('aria-label', 'Pay Bill (opens in a new window)');
  },
};

// Full width.
export const FullWidth = {
  args: { expand: true },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('xe-button');
    await expect(button).toHaveAttribute('expand');
    const anchor = await upgraded(button);
    await expect(anchor.classList.contains('expand')).toBe(true);
  },
};

// Disabled: a disabled <button>, not a link.
export const Disabled = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const control = await upgraded(canvasElement.querySelector('xe-button'));
    await expect(control.tagName).toBe('BUTTON');
    await expect(control).toBeDisabled();
  },
};

// No label yet: nothing renders on a published page…
export const Empty = {
  args: { label: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('xe-button')).toBeNull();
    await expect(canvasElement.querySelector('.xe-button-placeholder')).toBeNull();
  },
};

// …and an editor-only placeholder in the Universal Editor.
export const EditorEmpty = {
  args: { label: '' },
  render: (args) => renderBlock({
    name: 'xe-button',
    rows: fieldsToRows(args),
    variants: toVariants(args),
    decorate: (block) => {
      block.setAttribute('data-aue-resource', 'urn:aemconnection:/content/xcel/index/jcr:content/root/section/xe_button');
      return decorate(block);
    },
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.xe-button-placeholder')).toHaveTextContent('Add a button label and link');
  },
};

/** A row of buttons built with buildButton(), on an optional dark background. */
function gallery(rows, dark = false) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `display:grid;gap:1rem;padding:1.5rem;${dark ? 'background:#1b1b1b;' : ''}`;
  rows.forEach((props) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;';
    row.append(...props.map(buildButton));
    wrapper.append(row);
  });
  loadButton();
  return wrapper;
}

const TREATMENTS = ['filled', 'outlined', 'text'];
const VARIANTS = ['primary', 'secondary', 'accent', 'neutral', 'static-dark'];
// On dark backgrounds only: static-light, and tertiary (gold), whose text fails
// WCAG AA contrast on light ones. Filled tertiary (white on gold, 1.98:1)
// fails on any background, so it isn't shown.
const DARK_ONLY = [
  ...TREATMENTS.map((treatment) => ['static-light', treatment]),
  ['tertiary', 'outlined'],
  ['tertiary', 'text'],
];
const label = (variant, treatment) => `${variant} ${treatment}`;

// Every variant × treatment, built with buildButton().
export const Gallery = {
  render: () => {
    const page = document.createElement('div');
    page.append(
      gallery(VARIANTS.map((variant) => TREATMENTS.map((treatment) => ({
        label: label(variant, treatment), href: '#', variant, treatment,
      })))),
      gallery([DARK_ONLY.map(([variant, treatment]) => ({
        label: label(variant, treatment), href: '#', variant, treatment,
      }))], true),
      gallery([SIZES.map((size) => ({ label: `Size ${size}`, href: '#', size }))]),
    );
    return page;
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(
      VARIANTS.length * TREATMENTS.length + DARK_ONLY.length + SIZES.length,
    );
    await upgraded(canvasElement.querySelector('xe-button'));
  },
};

// buildButton() validates its props: unknown values are ignored (the default
// applies) and "outline" is accepted for "outlined".
export const BuildButton = {
  render: () => gallery([[
    {
      label: 'Validated', href: '#', variant: 'not-a-variant', treatment: 'outline', size: 'huge', expand: false,
    },
    { label: 'Submit', type: 'submit' },
  ]]),
  play: async ({ canvasElement }) => {
    const [validated, submit] = canvasElement.querySelectorAll('xe-button');
    await expect(validated).not.toHaveAttribute('variant');
    await expect(validated).toHaveAttribute('treatment', 'outlined');
    await expect(validated).not.toHaveAttribute('size');
    await expect(validated).not.toHaveAttribute('expand');
    const control = await upgraded(submit);
    await expect(control.tagName).toBe('BUTTON');
    await expect(control).toHaveAttribute('type', 'submit');
  },
};
