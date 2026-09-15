/*
 * Storybook stories for the XE Feature Cards block.
 *
 * Controls mirror the block's authoring model (blocks/xe-feature-cards/
 * _xe-feature-cards.json), so editing a control is like editing the field in
 * the Universal Editor. The model has two parts:
 *
 *   Container (xe-feature-cards):
 *     top-heading      text     -> "heading" control
 *     top-subheading   richtext -> "subheading" control (HTML)
 *
 *   Repeatable item (xe-feature-card), 0..n:
 *     card-title       text
 *     card-text        richtext (HTML)
 *     card-ctaLink     aem-content (link href)
 *     card-ctaLinkText text
 *
 * The card items are authored as a repeatable list, so they map to an `object`
 * control holding an array of card objects. `fieldsToRows` assembles the args
 * into the row/cell structure the decorator expects: a heading row, a
 * subheading row, then one row per card with [title, body, link] cells.
 */
import { expect, within } from 'storybook/test';
import decorate from './xe-feature-cards.js';
import { renderBlock } from '../../.storybook/eds.js';

const defaultCards = [
  {
    title: 'Renewable-first supply',
    text: '<p>Power sourced from wind and solar, matched to your usage in real time.</p>',
    ctaLink: '#',
    ctaLinkText: 'Explore plans',
  },
  {
    title: 'Transparent pricing',
    text: '<p>No hidden fees. See exactly what you pay per kWh, updated daily.</p>',
    ctaLink: '#',
    ctaLinkText: 'View rates',
  },
  {
    title: 'Real-time insights',
    text: '<p>Track consumption by the hour and spot savings across your home or business.</p>',
    ctaLink: '#',
    ctaLinkText: 'See the dashboard',
  },
  {
    title: 'Support that shows up',
    text: '<p>Talk to a real person, report outages, and manage billing in one place.</p>',
    ctaLink: '#',
    ctaLinkText: 'Contact us',
  },
];

const defaults = {
  heading: 'Our Services',
  subheading: '<p>Everything you need, all in one place</p>',
  cards: defaultCards,
};

/**
 * Assemble the model-field args into the authored row/cell structure the block
 * decorator reads: heading row, subheading row, then one [title, body, link]
 * row per card. A card contributes a link cell only when it has both a href and
 * link text, matching how the decorator picks up `linkCell.querySelector('a')`.
 */
function fieldsToRows(args) {
  const rows = [
    [args.heading],
    [args.subheading],
  ];
  (args.cards || []).forEach((card) => {
    const linkCell = card.ctaLink && card.ctaLinkText
      ? `<a href="${card.ctaLink}">${card.ctaLinkText}</a>`
      : '';
    rows.push([card.title || '', card.text || '', linkCell]);
  });
  return rows;
}

const argTypes = {
  heading: {
    control: 'text',
    description: 'Heading (text) — the section heading.',
    table: { category: 'Header' },
  },
  subheading: {
    control: 'text',
    description: 'Subheading (rich text) — HTML shown under the heading.',
    table: { category: 'Header' },
  },
  cards: {
    control: 'object',
    description:
      'Feature cards (repeatable xe-feature-card items). Each card: '
      + '{ title, text (HTML), ctaLink (href), ctaLinkText }.',
    table: { category: 'Cards' },
  },
};

export default {
  title: 'Blocks/XE Feature Cards',
  argTypes,
  args: defaults,
  render: (args) => renderBlock({ name: 'xe-feature-cards', rows: fieldsToRows(args), decorate }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A section heading and subheading above a responsive grid of feature '
          + 'cards, each with a title, description, and optional CTA link. '
          + 'Controls map one-to-one to the block\'s authoring model, so this '
          + 'page mirrors Universal Editor authoring.',
      },
    },
  },
};

// The full block: heading, subheading, and four cards in the two-column grid.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.xe-feature-cards-heading')).toHaveTextContent('Our Services');
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(4);
    // Each card renders a title and a CTA link.
    await expect(canvas.getByText('Renewable-first supply')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('a.xe-feature-card-link')).toHaveLength(4);
  },
};

// Two cards — a lighter section.
export const TwoCards = {
  args: { cards: defaultCards.slice(0, 2) },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(2);
  },
};

// Cards without CTA links — the link cell is optional in the model.
export const WithoutLinks = {
  args: {
    cards: defaultCards.slice(0, 3).map(({ title, text }) => ({ title, text })),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('a.xe-feature-card-link')).toHaveLength(0);
  },
};

// A single card, exercising the grid with one item.
export const SingleCard = {
  args: { cards: defaultCards.slice(0, 1) },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(1);
  },
};
