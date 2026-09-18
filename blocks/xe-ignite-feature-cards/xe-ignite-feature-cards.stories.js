/*
 * Storybook stories for the XE Ignite Feature Cards block.
 *
 * Controls mirror the block's authoring model (blocks/xe-ignite-feature-cards/
 * _xe-ignite-feature-cards.json), so editing a control is like editing the
 * field in the Universal Editor:
 *
 *   Container (xe-ignite-feature-cards):
 *     top-heading      text     -> "heading" control
 *     top-subheading   richtext -> "subheading" control (HTML)
 *
 *   Repeatable item (xe-ignite-feature-card), 0..n — surfaced as a multifield
 *   (one "Card N" group per slot):
 *     card-title       text
 *     card-text        richtext (HTML)
 *     card-ctaLink     aem-content (href)
 *     card-ctaLinkText text
 *
 * `fieldsToRows` assembles the args into the authored row/cell structure the
 * decorator reads: heading row, subheading row, then one [title, body, link]
 * row per non-empty card. The decorator then rebuilds those rows into the
 * web-component markup (<xe-featured-cards> > <xe-card-grid> > <xe-card> with
 * slotted title/body/actions and an <xe-button> CTA), defining those custom
 * elements on first run.
 */
import {
  expect, within, waitFor,
} from 'storybook/test';
import decorate from './xe-ignite-feature-cards.js';
import { renderBlock } from '../../.storybook/eds.js';

// Fixed number of card slots shown in the Controls panel.
const MAX_CARDS = 6;

// The three cards from the authoring guide.
const sampleCards = [
  {
    title: 'Billing & Payment',
    text: '<p>View your current bill, make payments, and set up autopay.</p>',
    linkText: 'View Bill',
    link: '#',
  },
  {
    title: 'Outage Center',
    text: '<p>Report an outage, check restoration status, and get alerts.</p>',
    linkText: 'Report Outage',
    link: '#',
  },
  {
    title: 'Save Energy',
    text: '<p>Explore rebates, energy tips, and programs to lower your bill.</p>',
    linkText: 'Explore Programs',
    link: '#',
  },
];

// Field-name helpers so the slot <-> arg mapping stays in one place.
const fieldName = (index, key) => `card${index + 1}${key}`; // e.g. card1Title
const cardLabel = (index) => `Card ${index + 1}`;

/** Spread card objects across the fixed, flat card-slot args. */
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

/** Collect flat card-slot args back into cards, dropping empty slots. */
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
 * row per non-empty card. A card contributes a link cell only when it has both
 * a href and link text, matching how the decorator picks up
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

// Header controls, then one field group per card slot ("Card N" categories).
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
    control: 'text', name: 'Title', description: 'card-title (text).', table: { category },
  };
  argTypes[fieldName(i, 'Text')] = {
    control: 'text', name: 'Description', description: 'card-text (rich text) — HTML.', table: { category },
  };
  argTypes[fieldName(i, 'LinkText')] = {
    control: 'text', name: 'Link text', description: 'card-ctaLinkText (text).', table: { category },
  };
  argTypes[fieldName(i, 'Link')] = {
    control: 'text', name: 'Link', description: 'card-ctaLink (href). Needs Link text to render a CTA.', table: { category },
  };
}

export default {
  title: 'Blocks/XE Ignite Feature Cards',
  argTypes,
  args: defaults,
  render: (args) => renderBlock({ name: 'xe-ignite-feature-cards', rows: fieldsToRows(args), decorate }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A section heading and subheading above a responsive grid of feature '
          + 'cards, rebuilt into web-component markup (<xe-featured-cards> > '
          + '<xe-card-grid> > <xe-card>) with slotted title/body/actions and an '
          + '<xe-button> CTA. The custom elements are defined by the block on '
          + 'first run. Each card is a multifield in the Controls panel, '
          + 'mirroring Universal Editor authoring. Empty card slots are not '
          + 'rendered.',
      },
    },
  },
};

// The full block: heading, subheading, and the three guide cards.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const featured = canvasElement.querySelector('xe-featured-cards');
    // Heading/subheading render from attributes on the wrapper element.
    await expect(featured).toHaveAttribute('heading', 'Our Services');
    // One <xe-card> per authored card; titles are slotted <h3>s in light DOM.
    await expect(canvasElement.querySelectorAll('xe-card')).toHaveLength(3);
    await expect(canvas.getByText('Billing & Payment')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('h3[slot="title"]')).toHaveLength(3);
    // Each card renders an <xe-button> CTA.
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(3);
    // The block defines and upgrades its custom elements.
    await waitFor(
      () => expect(customElements.get('xe-featured-cards')).toBeTruthy(),
      { timeout: 8000 },
    );
  },
};

// Two cards — a lighter section. Later slots are cleared so only two render.
export const TwoCards = {
  args: cardsToArgs(sampleCards.slice(0, 2)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-card')).toHaveLength(2);
  },
};

// Cards without CTA links — Link/Link text left blank, so no CTA renders.
export const WithoutLinks = {
  args: cardsToArgs(
    sampleCards.slice(0, 3).map(({ title, text }) => ({ title, text })),
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-card')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('xe-button')).toHaveLength(0);
  },
};

// A single card, exercising the grid with one item.
export const SingleCard = {
  args: cardsToArgs(sampleCards.slice(0, 1)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('xe-card')).toHaveLength(1);
  },
};
