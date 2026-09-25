/*
 * Storybook stories for the XE Banner block.
 *
 * Controls mirror the block's authoring model (blocks/xe-banner/_xe-banner.json),
 * so editing a control is like editing the field in the Universal Editor:
 *
 *   icon                select      -> "icon" control
 *   heading             text        -> "heading" control
 *   headingType         select      -> "headingType" control (h1–h4)
 *   message             richtext    -> "message" control (HTML)
 *   cta_link            aem-content -> "link" control (href)
 *   cta_linkText        text        -> "linkText" control
 *   classes_size        select      -> "size" control (block option class)
 *   classes_background  select      -> "background" control (block option class)
 *   classes_align       select      -> "align" control (block option class)
 *
 * `fieldsToRows` assembles the args into the authored row/cell structure the
 * decorator reads (icon, heading, message, then the CTA row). The decorator
 * then rebuilds those rows into the web-component markup (<xe-banner> >
 * <xe-banner-column> with slotted icon/heading/message/action).
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-banner.js';
import { renderBlock } from '../../.storybook/eds.js';

const defaults = {
  icon: 'leaf',
  heading: 'Save Energy, Save Money',
  headingType: 'h2',
  message: '<p>Explore rebates, tips, and programs to help reduce your energy use and lower your bill.</p>',
  linkText: 'Explore Programs',
  link: '#',
  size: 'size-generous',
  background: '',
  align: '',
};

/**
 * Assemble the model-field args into the authored row/cell structure the block
 * decorator reads, omitting blank fields the way an unfilled field would be.
 * `heading` + `headingType` collapse into one heading cell (xwalk field
 * collapsing); `cta_link` + `cta_linkText` group into one link cell.
 */
function fieldsToRows(args) {
  const rows = [];
  if (args.icon) rows.push([args.icon]);
  if (args.heading) rows.push([`<${args.headingType}>${args.heading}</${args.headingType}>`]);
  if (args.message) rows.push([args.message]);
  if (args.link && args.linkText) rows.push([`<p><a href="${args.link}">${args.linkText}</a></p>`]);
  return rows;
}

const argTypes = {
  icon: {
    control: 'select',
    options: ['none', 'leaf', 'bolt', 'lightbulb', 'house', 'piggy-bank'],
    description: 'icon (select) — decorative icon above the heading.',
    table: { category: 'Content' },
  },
  heading: {
    control: 'text', description: 'heading (text).', table: { category: 'Content' },
  },
  headingType: {
    control: 'select',
    options: ['h1', 'h2', 'h3', 'h4'],
    description: 'headingType (select) — heading level.',
    table: { category: 'Content' },
  },
  message: {
    control: 'text', description: 'message (rich text) — HTML shown under the heading.', table: { category: 'Content' },
  },
  linkText: {
    control: 'text', name: 'Action text', description: 'cta_linkText (text).', table: { category: 'Action' },
  },
  link: {
    control: 'text', name: 'Action link', description: 'cta_link (href). Needs text to render.', table: { category: 'Action' },
  },
  size: {
    control: 'select',
    options: ['', 'size-compact', 'size-generous'],
    description: 'classes_size (select) — vertical spacing.',
    table: { category: 'Layout' },
  },
  background: {
    control: 'select',
    options: ['', 'background-subtle'],
    description: 'classes_background (select) — surface color.',
    table: { category: 'Layout' },
  },
  align: {
    control: 'select',
    options: ['', 'align-left'],
    description: 'classes_align (select) — text alignment (center by default).',
    table: { category: 'Layout' },
  },
};

export default {
  title: 'Blocks/XE Banner',
  argTypes,
  args: defaults,
  render: (args) => renderBlock({
    name: 'xe-banner',
    rows: fieldsToRows(args),
    decorate,
    variants: [args.size, args.background, args.align].filter(Boolean),
  }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-width message banner with an optional icon, a heading, a rich-text '
          + 'message, and one outlined CTA, rebuilt into web-component markup '
          + '(<xe-banner> > <xe-banner-column> with slotted icon/heading/message/'
          + 'action, an <xe-button> CTA and <xe-icon> glyphs). Block options set the '
          + 'spacing, background, and alignment.',
      },
    },
  },
};

// The design reference: generous spacing, centered, leaf icon and outlined CTA.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvasElement.querySelector('xe-banner');
    await expect(banner).toHaveAttribute('variant', 'message');
    await expect(banner).toHaveAttribute('size', 'generous');
    await expect(banner).toHaveAttribute('background', 'default');
    const column = canvasElement.querySelector('xe-banner-column');
    await expect(column).toHaveAttribute('align', 'center');
    await expect(column).toHaveAttribute('heading-level', '2');
    await expect(canvasElement.querySelector('xe-icon[slot="icon"]')).toHaveAttribute('icon', 'faLeaf');
    await expect(canvasElement.querySelector('h2[slot="heading"]')).toHaveTextContent('Save Energy, Save Money');
    await expect(canvas.getByText(/Explore rebates, tips, and programs/)).toBeInTheDocument();
    const button = canvasElement.querySelector('xe-button[slot="action"]');
    await expect(button).toHaveAttribute('treatment', 'outlined');
    await expect(button.querySelector('xe-icon[slot="trailing-icon"]')).toHaveAttribute('icon', 'faArrowRight');
    // The CTA upgrades into a shadow-DOM anchor that navigates.
    await waitFor(
      () => expect(button.shadowRoot.querySelector('a')).toHaveAttribute('href', '#'),
      { timeout: 8000 },
    );
  },
};

// Default spacing, subtle background, left-aligned, H3 heading.
export const SubtleLeft = {
  args: {
    size: '', background: 'background-subtle', align: 'align-left', headingType: 'h3', icon: 'bolt',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('xe-banner')).toHaveAttribute('background', 'subtle');
    await expect(canvasElement.querySelector('xe-banner')).toHaveAttribute('size', 'default');
    await expect(canvasElement.querySelector('xe-banner-column')).toHaveAttribute('align', 'left');
    await expect(canvasElement.querySelector('h3[slot="heading"]')).toBeInTheDocument();
  },
};

// Icon set to "None" and no action — just the heading and message.
export const MessageOnly = {
  args: {
    icon: 'none', link: '', linkText: '', size: 'size-compact',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('xe-icon')).toBeNull();
    await expect(canvasElement.querySelector('xe-button')).toBeNull();
    await expect(canvasElement.querySelector('[slot="message"]')).toBeInTheDocument();
  },
};
