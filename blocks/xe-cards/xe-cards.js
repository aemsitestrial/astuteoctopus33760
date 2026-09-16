import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * XE Cards block
 *
 * Renders a heading/subheading above a responsive grid of Ignite UI Web
 * Components cards (`igc-card`). Each card is composed from the Ignite card
 * sub-components documented at
 * https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/card
 *   igc-card            container
 *   igc-card-media      image/media (keeps aspect ratio)
 *   igc-card-header     title + subtitle (slotted spans, not <h*>)
 *   igc-card-content    body text
 *   igc-card-actions    action buttons (igc-button)
 *
 * Ignite ships as the `igniteui-webcomponents` npm package. Rather than pull it
 * from a CDN at runtime, the card components this block uses are pre-bundled and
 * vendored into ./vendor/igniteui-webcomponents.js (a single self-contained ESM
 * file), so the library is served from our own origin. Regenerate it with
 * `npm run build:xe-cards-vendor` after bumping the package. The card is built
 * from slotted light-DOM elements, so content stays visible even before the
 * custom elements upgrade (progressive enhancement); once the module loads,
 * Ignite adds the card chrome.
 */

// Load + register the Ignite card components once, shared across all instances.
let ignitePromise;
function loadIgnite() {
  if (!ignitePromise) {
    ignitePromise = import('./vendor/igniteui-webcomponents.js')
      .then((mod) => {
        const {
          defineComponents,
          IgcCardComponent,
          IgcCardMediaComponent,
          IgcCardHeaderComponent,
          IgcCardContentComponent,
          IgcCardActionsComponent,
          IgcButtonComponent,
        } = mod;
        defineComponents(
          IgcCardComponent,
          IgcCardMediaComponent,
          IgcCardHeaderComponent,
          IgcCardContentComponent,
          IgcCardActionsComponent,
          IgcButtonComponent,
        );
      })
      .catch(() => {
        // Load failure: the slotted fallback content still renders, so swallow
        // the error rather than break the page.
      });
  }
  return ignitePromise;
}

/**
 * Build one <igc-card> from an authored card row.
 * Cells, in model order: [image, title, subtitle, text, link].
 */
function buildCard(row) {
  const card = document.createElement('igc-card');
  card.className = 'xe-card';
  moveInstrumentation(row, card);

  const [imageCell, titleCell, subtitleCell, textCell, linkCell] = [...row.children];

  const picture = imageCell?.querySelector('picture, img');
  if (picture) {
    const media = document.createElement('igc-card-media');
    media.className = 'xe-card-media';
    media.append(picture);
    card.append(media);
  }

  const titleText = titleCell?.textContent.trim();
  const subtitleText = subtitleCell?.textContent.trim();
  if (titleText || subtitleText) {
    const header = document.createElement('igc-card-header');
    header.className = 'xe-card-header';
    if (titleText) {
      const title = document.createElement('span');
      title.slot = 'title';
      title.className = 'xe-card-title';
      title.textContent = titleText;
      header.append(title);
    }
    if (subtitleText) {
      const subtitle = document.createElement('span');
      subtitle.slot = 'subtitle';
      subtitle.className = 'xe-card-subtitle';
      subtitle.textContent = subtitleText;
      header.append(subtitle);
    }
    card.append(header);
  }

  if (textCell && textCell.textContent.trim()) {
    const content = document.createElement('igc-card-content');
    content.className = 'xe-card-content';
    while (textCell.firstChild) content.append(textCell.firstChild);
    card.append(content);
  }

  const link = linkCell?.querySelector('a');
  if (link && link.textContent.trim()) {
    const actions = document.createElement('igc-card-actions');
    actions.className = 'xe-card-actions';
    // Ignite's igc-button renders an <a> when given an `href`.
    const button = document.createElement('igc-button');
    button.slot = 'start';
    button.className = 'xe-card-link';
    button.setAttribute('href', link.getAttribute('href') || '#');
    button.setAttribute('variant', 'outlined');
    button.textContent = link.textContent.trim();
    actions.append(button);
    card.append(actions);
  }

  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  const [headingRow, subheadingRow, ...cardRows] = rows;

  const header = document.createElement('div');
  header.className = 'xe-cards-header';

  if (headingRow) {
    const heading = document.createElement('h2');
    heading.className = 'xe-cards-heading';
    heading.textContent = headingRow.textContent.trim();
    moveInstrumentation(headingRow, heading);
    header.append(heading);
  }

  if (subheadingRow) {
    const subheading = document.createElement('div');
    subheading.className = 'xe-cards-subheading';
    while (subheadingRow.firstChild) subheading.append(subheadingRow.firstChild);
    moveInstrumentation(subheadingRow, subheading);
    header.append(subheading);
  }

  const list = document.createElement('div');
  list.className = 'xe-cards-list';
  cardRows.forEach((row) => list.append(buildCard(row)));

  block.textContent = '';
  block.append(header, list);

  loadIgnite();
}
