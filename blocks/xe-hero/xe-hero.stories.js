/*
 * Storybook stories for the XE Hero block.
 *
 * Controls mirror the block's authoring model (blocks/xe-hero/_xe-hero.json),
 * so editing a control is like editing the field in the Universal Editor:
 *
 *   image                reference   -> "image" control (src)
 *   imageAlt             text        -> "imageAlt" control
 *   title                richtext    -> "title" control (HTML)
 *   subtitle             richtext    -> "subtitle" control (HTML)
 *   cta_primaryLink      aem-content -> "primaryLink" control (href)
 *   cta_primaryLinkText  text        -> "primaryLinkText" control
 *   cta_secondaryLink    aem-content -> "secondaryLink" control (href)
 *   cta_secondaryLinkText text       -> "secondaryLinkText" control
 *   classes              select      -> "variant" control (locked layout preset)
 *
 * `fieldsToRows` assembles the args into the authored row/cell structure the
 * decorator reads (image, title, subtitle, then a CTA row per non-empty link).
 * The decorator then rebuilds those rows into the web-component markup
 * (<xe-hero> with slotted media/title/subtitle/actions and <xe-button> CTAs),
 * defining those custom elements on first run.
 */
import {
  expect, within, waitFor,
} from 'storybook/test';
import decorate from './xe-hero.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

// A neutral, license-free placeholder background for the hero media layer.
const SAMPLE_IMAGE = 'https://picsum.photos/1600/900';

const defaults = {
  image: SAMPLE_IMAGE,
  imageAlt: 'Sunlit mountain landscape',
  title: '<h1>Power your day with confidence</h1>',
  subtitle: '<p>Manage your account, track usage, and stay ahead of every bill.</p>',
  primaryLinkText: 'Get started',
  primaryLink: '#',
  secondaryLinkText: 'Learn more',
  secondaryLink: '#',
  variant: '',
};

// Locked layout-preset variant classes (see the "classes" field in the model).
const VARIANTS = [
  '',
  'tall-center-with-action',
  'tall-left-with-actions',
  'standard-center-with-actions',
  'standard-left-with-actions',
  'compact-center-with-actions',
  'compact-left-with-actions',
];

/**
 * Assemble the model-field args into the authored row/cell structure the block
 * decorator reads: an image row, a title row, a subtitle row, then one CTA row
 * per link that has both a href and link text (matching how the decorator picks
 * up `cell.querySelectorAll('a')`).
 */
function fieldsToRows(args) {
  const rows = [];
  if (args.image) rows.push([picture(args.image, args.imageAlt || '')]);
  if (args.title) rows.push([args.title]);
  if (args.subtitle) rows.push([args.subtitle]);
  if (args.primaryLink && args.primaryLinkText) {
    rows.push([`<a href="${args.primaryLink}">${args.primaryLinkText}</a>`]);
  }
  if (args.secondaryLink && args.secondaryLinkText) {
    rows.push([`<a href="${args.secondaryLink}">${args.secondaryLinkText}</a>`]);
  }
  return rows;
}

const argTypes = {
  image: {
    control: 'text', description: 'image (reference) — background image src.', table: { category: 'Media' },
  },
  imageAlt: {
    control: 'text', description: 'imageAlt (text) — alternative text.', table: { category: 'Media' },
  },
  title: {
    control: 'text', description: 'title (rich text) — HTML heading.', table: { category: 'Content' },
  },
  subtitle: {
    control: 'text', description: 'subtitle (rich text) — HTML shown under the title.', table: { category: 'Content' },
  },
  primaryLinkText: {
    control: 'text', name: 'Primary action text', description: 'cta_primaryLinkText (text).', table: { category: 'Actions' },
  },
  primaryLink: {
    control: 'text', name: 'Primary action link', description: 'cta_primaryLink (href). Needs text to render.', table: { category: 'Actions' },
  },
  secondaryLinkText: {
    control: 'text', name: 'Secondary action text', description: 'cta_secondaryLinkText (text).', table: { category: 'Actions' },
  },
  secondaryLink: {
    control: 'text', name: 'Secondary action link', description: 'cta_secondaryLink (href). Needs text to render.', table: { category: 'Actions' },
  },
  variant: {
    control: 'select',
    options: VARIANTS,
    description: 'classes (select) — locked layout preset (height + alignment).',
    table: { category: 'Layout' },
  },
};

export default {
  title: 'Blocks/XE Hero',
  argTypes,
  args: defaults,
  render: (args) => renderBlock({
    name: 'xe-hero',
    rows: fieldsToRows(args),
    decorate,
    variants: args.variant ? [args.variant] : [],
  }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-bleed hero with a background image behind a scrim, a title, an '
          + 'optional subtitle, and up to two positional CTAs, rebuilt into '
          + 'web-component markup (<xe-hero> with slotted media/title/subtitle/'
          + 'actions and <xe-button> CTAs). The custom elements are defined by the '
          + 'block on first run. Six locked layout variants set height and text '
          + 'alignment; the base variant uses the responsive default.',
      },
    },
  },
};

// The full hero: image, title, subtitle, and two CTAs.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hero = canvasElement.querySelector('xe-hero');
    await expect(hero).toBeInTheDocument();
    // Title is a slotted <h1> in light DOM.
    await expect(canvas.getByText('Power your day with confidence')).toBeInTheDocument();
    await expect(canvasElement.querySelector('h1[slot="title"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('p[slot="subtitle"]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('img[slot="media"]')).toBeInTheDocument();
    // Two CTAs render as <xe-button> elements.
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(2);
    // The block defines and upgrades its custom elements.
    await waitFor(
      () => expect(customElements.get('xe-hero')).toBeTruthy(),
      { timeout: 8000 },
    );
  },
};

// A single primary CTA — the secondary link/text left blank.
export const SinglePrimaryAction = {
  args: { secondaryLink: '', secondaryLinkText: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(1);
    await expect(canvasElement.querySelector('xe-button')).toHaveAttribute('variant', 'primary');
  },
};

// No CTAs — both links left blank, so no actions slot renders.
export const WithoutActions = {
  args: {
    primaryLink: '', primaryLinkText: '', secondaryLink: '', secondaryLinkText: '',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(0);
    await expect(canvasElement.querySelector('div[slot="actions"]')).toBeNull();
  },
};

// A locked "Tall Left with Actions" preset — height=tall, align=left.
export const TallLeft = {
  args: { variant: 'tall-left-with-actions' },
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector('xe-hero');
    await expect(hero).toHaveAttribute('height', 'tall');
    await expect(hero).toHaveAttribute('align', 'left');
  },
};

// A locked "Compact Center with Actions" preset — height=compact, align=center.
export const CompactCenter = {
  args: { variant: 'compact-center-with-actions' },
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector('xe-hero');
    await expect(hero).toHaveAttribute('height', 'compact');
    await expect(hero).toHaveAttribute('align', 'center');
  },
};

// No image — media layer stays empty; the neutral background prevents a gap.
export const WithoutImage = {
  args: { image: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img[slot="media"]')).toBeNull();
    await expect(canvasElement.querySelector('h1[slot="title"]')).toBeInTheDocument();
  },
};
