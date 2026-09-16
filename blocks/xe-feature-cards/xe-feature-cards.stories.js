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
 * The repeatable card item is surfaced as a multifield: instead of one opaque
 * JSON blob, each card is broken into its own fields (Title / Description /
 * Link text / Link), grouped under a "Card N" category in the Controls panel —
 * the same shape an author sees for a multifield in the Universal Editor.
 * Storybook controls are a fixed schema (no runtime add/remove of groups), so
 * we expose a fixed number of card slots; a slot with no title AND no text is
 * treated as empty and simply not rendered.
 */
import { expect, within } from 'storybook/test';
import decorate from './xe-feature-cards.js';
import { renderBlock } from '../../.storybook/eds.js';

// Number of card slots shown in the Controls panel. Bump this if a story needs
// more than this many cards at once.
const MAX_CARDS = 6;

const sampleCards = [
  {
    title: 'Renewable-first supply',
    text: '<p>Power sourced from wind and solar, matched to your usage in real time.</p>',
    linkText: 'Explore plans',
    link: '#',
  },
  {
    title: 'Transparent pricing',
    text: '<p>No hidden fees. See exactly what you pay per kWh, updated daily.</p>',
    linkText: 'View rates',
    link: '#',
  },
  {
    title: 'Real-time insights',
    text: '<p>Track consumption by the hour and spot savings across your home or business.</p>',
    linkText: 'See the dashboard',
    link: '#',
  },
  {
    title: 'Support that shows up',
    text: '<p>Talk to a real person, report outages, and manage billing in one place.</p>',
    linkText: 'Contact us',
    link: '#',
  },
];

// Field-name helpers so the slot <-> arg mapping stays in one place.
const fieldName = (index, key) => `card${index + 1}${key}`; // e.g. card1Title
const cardLabel = (index) => `Card ${index + 1}`;

/**
 * Spread an array of card objects across the fixed, flat card-slot args
 * (card1Title, card1Text, ...). Slots beyond the given cards stay empty.
 */
function cardsToArgs(cards) {
  const out = {};
  for (let i = 0; i < MAX_CARDS; i += 1) {
    const card = cards[i] || {};
    out[fieldName(i, 'Title')] = card.title || '';
    out[fieldName(i, 'Text')] = card.text || '';
    out[fieldName(i, 'LinkText')] = card.linkText || '';
    out[fieldName(i, 'Link')] = card.link || '';
  }
  return out;
}

/**
 * Collect the flat card-slot args back into an ordered list of cards, dropping
 * empty slots (no title and no description).
 */
function argsToCards(args) {
  const cards = [];
  for (let i = 0; i < MAX_CARDS; i += 1) {
    const title = args[fieldName(i, 'Title')] || '';
    const text = args[fieldName(i, 'Text')] || '';
    const linkText = args[fieldName(i, 'LinkText')] || '';
    const link = args[fieldName(i, 'Link')] || '';
    if (title.trim() || text.trim()) {
      cards.push({
        title, text, linkText, link,
      });
    }
  }
  return cards;
}

const defaults = {
  heading: 'Our Services',
  subheading: '<p>Everything you need, all in one place</p>',
  ...cardsToArgs(sampleCards),
};

/**
 * Assemble the model-field args into the authored row/cell structure the block
 * decorator reads: heading row, subheading row, then one [title, body, link]
 * row per (non-empty) card. A card contributes a link cell only when it has
 * both a href and link text, matching how the decorator picks up
 * `linkCell.querySelector('a')`.
 */
function fieldsToRows(args) {
  const rows = [
    [args.heading],
    [args.subheading],
  ];
  argsToCards(args).forEach((card) => {
    const linkCell = card.link && card.linkText
      ? `<a href="${card.link}">${card.linkText}</a>`
      : '';
    rows.push([card.title, card.text, linkCell]);
  });
  return rows;
}

// Header controls, then one field group per card slot. The `table.category`
// grouping is what renders each card's fields together as a "Card N" section,
// giving the Controls panel the feel of a multifield.
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
};

for (let i = 0; i < MAX_CARDS; i += 1) {
  const category = cardLabel(i);
  argTypes[fieldName(i, 'Title')] = {
    control: 'text',
    name: 'Title',
    description: 'card-title (text).',
    table: { category },
  };
  argTypes[fieldName(i, 'Text')] = {
    control: 'text',
    name: 'Description',
    description: 'card-text (rich text) — HTML.',
    table: { category },
  };
  argTypes[fieldName(i, 'LinkText')] = {
    control: 'text',
    name: 'Link text',
    description: 'card-ctaLinkText (text).',
    table: { category },
  };
  argTypes[fieldName(i, 'Link')] = {
    control: 'text',
    name: 'Link',
    description: 'card-ctaLink (link href). Needs Link text to render a CTA.',
    table: { category },
  };
}

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
          + 'Each card is a multifield in the Controls panel (grouped as '
          + '"Card N"), mirroring Universal Editor authoring. Empty card slots '
          + 'are not rendered.',
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

// Two cards — a lighter section. Later slots are cleared so only two render.
export const TwoCards = {
  args: cardsToArgs(sampleCards.slice(0, 2)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(2);
  },
};

// Cards without CTA links — Link/Link text left blank, so no CTA renders.
export const WithoutLinks = {
  args: cardsToArgs(
    sampleCards.slice(0, 3).map(({ title, text }) => ({ title, text })),
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('a.xe-feature-card-link')).toHaveLength(0);
  },
};

// A single card, exercising the grid with one item.
export const SingleCard = {
  args: cardsToArgs(sampleCards.slice(0, 1)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.xe-feature-card')).toHaveLength(1);
  },
};
