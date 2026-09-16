/* eslint-disable max-classes-per-file */
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * XE Ignite Feature Cards
 *
 * decorate() rebuilds the authored EDS table rows into the web-component
 * semantics shown in the authoring guide:
 *
 *   <xe-featured-cards heading="…" subheading="…" align="left" background="default">
 *     <xe-card-grid>
 *       <xe-card variant="surface" treatment="filled">
 *         <h3 slot="title">…</h3>
 *         <p>…</p>
 *         <div slot="actions">
 *           <xe-button variant="primary" treatment="outline">…</xe-button>
 *         </div>
 *       </xe-card>
 *       …
 *     </xe-card-grid>
 *   </xe-featured-cards>
 *
 * The `slot` attributes and the attribute-driven heading/subheading only mean
 * something inside real custom elements, so the four tags are defined below as
 * small shadow-DOM components. The heading/subheading render from attributes;
 * card content is distributed through named slots.
 */

const SURFACE = '#f4efe9';
const BRAND = '#9d1c26';

/**
 * <xe-featured-cards> — section wrapper. Renders the heading + subheading from
 * attributes above a default slot that holds the card grid.
 */
class XeFeaturedCards extends HTMLElement {
  static get observedAttributes() {
    return ['heading', 'subheading', 'align'];
  }

  connectedCallback() {
    if (!this.shadowRoot) this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    const heading = this.getAttribute('heading') || '';
    const subheading = this.getAttribute('subheading') || '';
    root.innerHTML = `
      <style>
        :host { display: block; text-align: ${this.getAttribute('align') || 'left'}; }
        .header { margin-bottom: 32px; }
        .heading {
          font-family: var(--heading-font-family);
          font-size: clamp(40px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -1px;
          color: var(--brand-text-primary, #1a1a1a);
          margin: 0 0 16px;
        }
        .subheading {
          font-size: 18px;
          color: var(--brand-text-secondary, #4b5563);
          line-height: 1.6;
          margin: 0;
        }
        .header:empty { display: none; }
      </style>
      <div class="header">
        ${heading ? `<h2 class="heading">${heading}</h2>` : ''}
        ${subheading ? `<div class="subheading">${subheading}</div>` : ''}
      </div>
      <slot></slot>
    `;
  }
}

/**
 * <xe-card-grid> — responsive two-column grid of cards.
 */
class XeCardGrid extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (width <= 768px) {
          :host { grid-template-columns: 1fr; }
        }
      </style>
      <slot></slot>
    `;
  }
}

/**
 * <xe-card> — a single feature card. Distributes content through three slots:
 * `title`, the default slot (body), and `actions`.
 */
class XeCard extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border-radius: 8px;
          padding: 32px;
        }
        :host([treatment="filled"]) { background: ${SURFACE}; }
        ::slotted([slot="title"]) {
          font-family: var(--heading-font-family);
          font-size: 26px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: var(--brand-text-primary, #1a1a1a);
          margin: 0 0 12px;
        }
        .body {
          font-size: 17px;
          color: var(--brand-text-secondary, #4b5563);
          line-height: 1.55;
          margin: 0 0 24px;
        }
        ::slotted([slot="actions"]) { margin-top: auto; }
      </style>
      <slot name="title"></slot>
      <div class="body"><slot></slot></div>
      <slot name="actions"></slot>
    `;
  }
}

/**
 * <xe-button> — CTA. Renders an anchor when it carries an href so the CTA still
 * navigates; otherwise a plain button. The primary/outline treatment matches
 * the maroon outlined button in the guide.
 */
class XeButton extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const href = this.getAttribute('href');
    const label = '<slot></slot>';
    const shared = `
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: var(--heading-font-family);
      font-size: 15px;
      font-weight: 700;
      line-height: 1;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    `;
    root.innerHTML = `
      <style>
        :host { display: inline-block; }
        .btn { ${shared} }
        :host([variant="primary"][treatment="outline"]) .btn {
          border: 2px solid ${BRAND};
          background: transparent;
          color: ${BRAND};
        }
        :host([variant="primary"][treatment="outline"]) .btn:hover,
        :host([variant="primary"][treatment="outline"]) .btn:focus {
          background: ${BRAND};
          color: #fff;
        }
      </style>
      ${href
    ? `<a class="btn" href="${href}">${label}</a>`
    : `<button class="btn" type="button">${label}</button>`}
    `;
  }
}

// Register once — the block can be decorated multiple times per page.
[
  ['xe-featured-cards', XeFeaturedCards],
  ['xe-card-grid', XeCardGrid],
  ['xe-card', XeCard],
  ['xe-button', XeButton],
].forEach(([name, ctor]) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
});

export default function decorate(block) {
  const rows = [...block.children];
  const [headingRow, subheadingRow, ...cardRows] = rows;

  const featured = document.createElement('xe-featured-cards');
  featured.className = 'xe-ignite-feature-cards-featured';
  if (headingRow) featured.setAttribute('heading', headingRow.textContent.trim());
  if (subheadingRow) featured.setAttribute('subheading', subheadingRow.textContent.trim());
  featured.setAttribute('align', 'left');
  featured.setAttribute('background', 'default');

  const grid = document.createElement('xe-card-grid');

  cardRows.forEach((row) => {
    const [titleCell, bodyCell, linkCell] = [...row.children];

    const card = document.createElement('xe-card');
    moveInstrumentation(row, card);
    card.setAttribute('variant', 'surface');
    card.setAttribute('treatment', 'filled');

    if (titleCell) {
      const title = document.createElement('h3');
      title.setAttribute('slot', 'title');
      title.textContent = titleCell.textContent.trim();
      card.append(title);
    }

    if (bodyCell) {
      // Body paragraphs go into the card's default slot.
      while (bodyCell.firstChild) card.append(bodyCell.firstChild);
    }

    const link = linkCell?.querySelector('a');
    if (link) {
      const actions = document.createElement('div');
      actions.setAttribute('slot', 'actions');

      const button = document.createElement('xe-button');
      button.setAttribute('variant', 'primary');
      button.setAttribute('treatment', 'outline');
      const href = link.getAttribute('href');
      if (href) button.setAttribute('href', href);
      button.textContent = link.textContent.trim();

      actions.append(button);
      card.append(actions);
    }

    grid.append(card);
  });

  featured.append(grid);

  block.textContent = '';
  block.append(featured);
}
