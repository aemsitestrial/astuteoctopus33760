import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * XE Ignite Feature Cards (npm)
 *
 * Same authoring model and layout as xe-ignite-feature-cards, but the cards are
 * built from real Ignite UI Web Components sourced from the
 * `igniteui-webcomponents` npm package (a package.json dependency) rather than
 * hand-written custom elements:
 *   igc-card            container
 *   igc-card-header     title (slotted span)
 *   igc-card-content    body text
 *   igc-card-actions    action buttons
 *   igc-button          the CTA (renders an <a> when given an href)
 *
 * EDS runs in the browser, which can't resolve the bare `igniteui-webcomponents`
 * specifier, so the needed components are pre-bundled into
 * ./vendor/igniteui-webcomponents.js (a self-contained ESM file built from
 * node_modules). Regenerate it with
 * `npm run build:xe-ignite-feature-cards-npm-vendor` after bumping the package.
 *
 * The card is assembled from slotted light-DOM elements, so authored content
 * stays visible even before the custom elements upgrade (progressive
 * enhancement); once the module loads, Ignite adds the card chrome.
 */

// Load + register the Ignite components once, shared across all instances.
let ignitePromise;
function loadIgnite() {
  if (!ignitePromise) {
    ignitePromise = import('./vendor/igniteui-webcomponents.js')
      .then((mod) => {
        const {
          defineComponents,
          IgcCardComponent,
          IgcCardHeaderComponent,
          IgcCardContentComponent,
          IgcCardActionsComponent,
          IgcButtonComponent,
        } = mod;
        defineComponents(
          IgcCardComponent,
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
 * Cells, in model order: [title, text, link].
 */
function buildCard(row) {
  const card = document.createElement('igc-card');
  card.className = 'xe-ignite-feature-card';
  moveInstrumentation(row, card);

  const [titleCell, bodyCell, linkCell] = [...row.children];

  const titleText = titleCell?.textContent.trim();
  if (titleText) {
    const header = document.createElement('igc-card-header');
    header.className = 'xe-ignite-feature-card-header';
    const title = document.createElement('h3');
    title.slot = 'title';
    title.className = 'xe-ignite-feature-card-title';
    title.textContent = titleText;
    header.append(title);
    card.append(header);
  }

  if (bodyCell && bodyCell.textContent.trim()) {
    const content = document.createElement('igc-card-content');
    content.className = 'xe-ignite-feature-card-body';
    while (bodyCell.firstChild) content.append(bodyCell.firstChild);
    card.append(content);
  }

  const link = linkCell?.querySelector('a');
  if (link && link.textContent.trim()) {
    const actions = document.createElement('igc-card-actions');
    actions.className = 'xe-ignite-feature-card-cta';
    // Ignite's igc-button renders an <a> when given an `href`.
    const button = document.createElement('igc-button');
    button.slot = 'start';
    button.className = 'xe-ignite-feature-card-link';
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
  header.className = 'xe-ignite-feature-cards-npm-header';

  if (headingRow) {
    const heading = document.createElement('h2');
    heading.className = 'xe-ignite-feature-cards-npm-heading';
    heading.textContent = headingRow.textContent.trim();
    moveInstrumentation(headingRow, heading);
    header.append(heading);
  }

  if (subheadingRow) {
    const subheading = document.createElement('div');
    subheading.className = 'xe-ignite-feature-cards-npm-subheading';
    while (subheadingRow.firstChild) subheading.append(subheadingRow.firstChild);
    moveInstrumentation(subheadingRow, subheading);
    header.append(subheading);
  }

  const list = document.createElement('div');
  list.className = 'xe-ignite-feature-cards-npm-list';
  cardRows.forEach((row) => list.append(buildCard(row)));

  block.textContent = '';
  block.append(header, list);

  loadIgnite();
}
