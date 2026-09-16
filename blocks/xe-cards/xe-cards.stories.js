/*
 * Storybook stories for the XE Cards block (Ignite UI Web Components cards).
 *
 * Controls mirror the block's authoring model (blocks/xe-cards/_xe-cards.json),
 * so editing a control is like editing the field in the Universal Editor:
 *
 *   Container (xe-cards):
 *     top-heading      text     -> "heading" control
 *     top-subheading   richtext -> "subheading" control (HTML)
 *
 *   Repeatable item (xe-card), 0..n — surfaced as a multifield (one "Card N"
 *   group per slot, each with its own fields):
 *     card-image       reference   (asset URL)
 *     card-imageAlt    text
 *     card-title       text
 *     card-subtitle    text
 *     card-text        richtext (HTML)
 *     card-ctaLink     aem-content (href)
 *     card-ctaLinkText text
 *
 * `fieldsToRows` assembles the args into the row/cell structure the decorator
 * reads: heading row, subheading row, then one [image, title, subtitle, text,
 * link] row per non-empty card. The block then loads Ignite from a CDN and
 * upgrades each card into an <igc-card>.
 */
import { expect, within, waitFor } from 'storybook/test';
import decorate from './xe-cards.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

// Fixed number of card slots shown in the Controls panel.
const MAX_CARDS = 6;

const sampleCards = [
  {
    image: 'https://picsum.photos/seed/renewable/640/400',
    imageAlt: 'Wind turbines',
    title: 'Renewable-first supply',
    subtitle: 'Wind & solar',
    text: '<p>Power sourced from wind and solar, matched to your usage in real time.</p>',
    linkText: 'Explore plans',
    link: '#',
  },
  {
    image: 'https://picsum.photos/seed/pricing/640/400',
    imageAlt: 'Meter',
    title: 'Transparent pricing',
    subtitle: 'No hidden fees',
    text: '<p>See exactly what you pay per kWh, updated daily.</p>',
    linkText: 'View rates',
    link: '#',
  },
  {
    image: 'https://picsum.photos/seed/insights/640/400',
    imageAlt: 'Dashboard',
    title: 'Real-time insights',
    subtitle: 'Hourly tracking',
    text: '<p>Track consumption by the hour and spot savings across your home or business.</p>',
    linkText: 'See the dashboard',
    link: '#',
  },
];

const fieldName = (index, key) => `card${index + 1}${key}`;
const cardLabel = (index) => `Card ${index + 1}`;

/** Spread card objects across the fixed, flat card-slot args. */
function cardsToArgs(cards) {
  const out = {};
  for (let i = 0; i < MAX_CARDS; i += 1) {
    const card = cards[i] || {};
    out[fieldName(i, 'Image')] = card.image || '';
    out[fieldName(i, 'ImageAlt')] = card.imageAlt || '';
    out[fieldName(i, 'Title')] = card.title || '';
    out[fieldName(i, 'Subtitle')] = card.subtitle || '';
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
    const card = {
      image: args[fieldName(i, 'Image')] || '',
      imageAlt: args[fieldName(i, 'ImageAlt')] || '',
      title: args[fieldName(i, 'Title')] || '',
      subtitle: args[fieldName(i, 'Subtitle')] || '',
      text: args[fieldName(i, 'Text')] || '',
      linkText: args[fieldName(i, 'LinkText')] || '',
      link: args[fieldName(i, 'Link')] || '',
    };
    if (card.title.trim() || card.text.trim() || card.image.trim()) cards.push(card);
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
 * decorator reads: heading row, subheading row, then one
 * [image, title, subtitle, text, link] row per non-empty card.
 */
function fieldsToRows(args) {
  const rows = [
    [args.heading],
    [args.subheading],
  ];
  argsToCards(args).forEach((card) => {
    const imageCell = card.image ? picture(card.image, card.imageAlt) : '';
    const linkCell = card.link && card.linkText
      ? `<a href="${card.link}">${card.linkText}</a>`
      : '';
    rows.push([imageCell, card.title, card.subtitle, card.text, linkCell]);
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
  argTypes[fieldName(i, 'Image')] = {
    control: 'text', name: 'Image', description: 'card-image (reference) — asset URL.', table: { category },
  };
  argTypes[fieldName(i, 'ImageAlt')] = {
    control: 'text', name: 'Image alt', description: 'card-imageAlt (text).', table: { category },
  };
  argTypes[fieldName(i, 'Title')] = {
    control: 'text', name: 'Title', description: 'card-title (text).', table: { category },
  };
  argTypes[fieldName(i, 'Subtitle')] = {
    control: 'text', name: 'Subtitle', description: 'card-subtitle (text).', table: { category },
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
  title: 'Blocks/XE Cards',
  argTypes,
  args: defaults,
  render: (args) => renderBlock({ name: 'xe-cards', rows: fieldsToRows(args), decorate }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A section heading and subheading above a responsive grid of Ignite UI '
          + 'Web Components cards (igc-card), each with an image, title, subtitle, '
          + 'description, and optional CTA button. The block loads Ignite from a '
          + 'CDN and upgrades the slotted content into cards. Each card is a '
          + 'multifield in the Controls panel, mirroring Universal Editor authoring.',
      },
    },
  },
};

// The full block: heading, subheading, and three Ignite cards.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.xe-cards-heading')).toHaveTextContent('Our Services');
    // Three cards, each an <igc-card> host with slotted title + image + CTA.
    await expect(canvasElement.querySelectorAll('igc-card.xe-card')).toHaveLength(3);
    await expect(canvas.getByText('Renewable-first supply')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.xe-card-media img')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('igc-button.xe-card-link')).toHaveLength(3);
    // Ignite loads from a CDN and upgrades the custom elements.
    await waitFor(
      () => expect(customElements.get('igc-card')).toBeTruthy(),
      { timeout: 8000 },
    );
  },
};

// Two cards.
export const TwoCards = {
  args: cardsToArgs(sampleCards.slice(0, 2)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('igc-card.xe-card')).toHaveLength(2);
  },
};

// Cards without CTA links — Link/Link text left blank, so no action button.
export const WithoutLinks = {
  args: cardsToArgs(
    sampleCards.slice(0, 3).map(({
      image, imageAlt, title, subtitle, text,
    }) => ({
      image, imageAlt, title, subtitle, text,
    })),
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('igc-card.xe-card')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('igc-button.xe-card-link')).toHaveLength(0);
  },
};

// A single card.
export const SingleCard = {
  args: cardsToArgs(sampleCards.slice(0, 1)),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('igc-card.xe-card')).toHaveLength(1);
  },
};
