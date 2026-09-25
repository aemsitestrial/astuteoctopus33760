/* eslint-disable max-classes-per-file */
import { moveInstrumentation } from '../../scripts/scripts.js';
import '../../scripts/components/xe-button.js';
import '../../scripts/components/xe-icon.js';

/*
 * XE Banner
 *
 * decorate() rebuilds the authored EDS table rows into web-component semantics,
 * following the same shadow-DOM approach as xe-hero.js:
 *
 *   <xe-banner variant="message" size="generous" background="default">
 *     <xe-banner-column expand align="center" heading-level="2">
 *       <xe-icon slot="icon" icon="faLeaf" size="lg"></xe-icon>
 *       <h2 slot="heading">Save Energy, Save Money</h2>
 *       <div slot="message"><p>Explore rebates, tips, and programs…</p></div>
 *       <xe-button slot="action" variant="primary" treatment="outlined" size="sm" href="…">
 *         Explore Programs<xe-icon slot="trailing-icon" size="sm" icon="faArrowRight"></xe-icon>
 *       </xe-button>
 *     </xe-banner-column>
 *   </xe-banner>
 *
 * The heading is a real <hN> (level from the authored heading type) rather than
 * a bare <span>, so it stays in the document outline for crawlers and assistive
 * tech. <xe-banner> and <xe-banner-column> are defined below; <xe-button> and
 * <xe-icon> are shared with the other xe-* blocks (scripts/components).
 */

const TEXT_COLOR = '#2b2926';
const ACTION_COLOR = '#a6192e';
const SUBTLE_BACKGROUND = '#f5f4f2';

// Authored icon option (see the "icon" field in _xe-banner.json) -> <xe-icon> name.
const ICON_OPTIONS = {
  none: '',
  leaf: 'faLeaf',
  bolt: 'faBolt',
  lightbulb: 'faLightbulb',
  house: 'faHouse',
  'piggy-bank': 'faPiggyBank',
};

// Block option classes (the classes_* fields) -> <xe-banner>/<xe-banner-column> attributes.
const SIZES = ['compact', 'generous'];
const BACKGROUNDS = ['subtle'];
const ALIGNMENTS = ['left'];

/**
 * <xe-banner> — full-width message band. `size` sets the vertical padding,
 * `background` the surface color. Columns render through the default slot.
 */
class XeBanner extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: transparent;
          color: ${TEXT_COLOR};
          --xe-button-primary: ${ACTION_COLOR};
          --xe-button-font-family: var(--body-font-family);
          --_padding-block: 3rem;
        }
        :host([background="subtle"]) { background-color: ${SUBTLE_BACKGROUND}; }
        :host([size="compact"]) { --_padding-block: 2rem; }
        :host([size="generous"]) { --_padding-block: 4rem; }
        .inner {
          display: flex;
          gap: 2rem;
          max-width: 1200px;
          margin-inline: auto;
          padding: var(--_padding-block) 24px;
          box-sizing: border-box;
        }
        @media (width >= 900px) {
          :host([size="generous"]) { --_padding-block: 5.5rem; }
          .inner { padding-inline: 32px; }
        }
      </style>
      <div class="inner"><slot></slot></div>
    `;
  }
}

/**
 * <xe-banner-column> — one stacked column: icon, heading, message, action.
 * `expand` lets the column fill the banner; `align` sets text alignment.
 */
class XeBannerColumn extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 0;
        }
        :host([expand]) { flex: 1 1 0; }
        :host([align="left"]) {
          align-items: flex-start;
          text-align: left;
        }
        /* Slotted text typography lives in xe-banner.css: page-level heading/paragraph
           rules would otherwise outrank ::slotted() for light-DOM children. */
        ::slotted([slot="icon"]) { margin-bottom: 1.5rem; }
        ::slotted([slot="message"]) { max-width: 34rem; margin-top: 1.5rem; }
        ::slotted([slot="action"]) { margin-top: 1.5rem; }
      </style>
      <slot name="icon"></slot>
      <slot name="heading"></slot>
      <slot name="message"></slot>
      <slot name="action"></slot>
    `;
  }
}

// Register once — the block can be decorated multiple times per page.
[
  ['xe-banner', XeBanner],
  ['xe-banner-column', XeBannerColumn],
].forEach(([name, ctor]) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
});

/** Returns the value of the first `<prefix>-<value>` block class in `values`. */
function optionFromClass(block, prefix, values) {
  return values.find((value) => block.classList.contains(`${prefix}-${value}`));
}

export default function decorate(block) {
  const rows = [...block.children];

  // Classify authored rows by content (model field order in _xe-banner.json:
  // icon, heading, message, action), so blank or missing rows are tolerated.
  let iconName = '';
  let headingEl = null;
  let messageCell = null;
  let linkEl = null;

  rows.forEach((row) => {
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    const text = cell.textContent.trim();
    const link = cell.querySelector('a');
    if (!linkEl && link) {
      linkEl = link;
      return;
    }
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (!headingEl && heading) {
      headingEl = heading;
      return;
    }
    const iconKey = text.toLowerCase();
    if (!headingEl && !messageCell && Object.hasOwn(ICON_OPTIONS, iconKey)) {
      iconName = ICON_OPTIONS[iconKey];
      return;
    }
    if (!messageCell && text) messageCell = cell;
  });

  const size = optionFromClass(block, 'size', SIZES) || 'default';
  const background = optionFromClass(block, 'background', BACKGROUNDS) || 'default';
  const align = optionFromClass(block, 'align', ALIGNMENTS) || 'center';
  const level = headingEl ? headingEl.tagName.slice(1) : '2';

  const banner = document.createElement('xe-banner');
  banner.setAttribute('variant', 'message');
  banner.setAttribute('size', size);
  banner.setAttribute('background', background);

  const column = document.createElement('xe-banner-column');
  column.setAttribute('expand', '');
  column.setAttribute('align', align);
  column.setAttribute('heading-level', level);
  banner.append(column);

  // --- Icon ---
  if (iconName) {
    const icon = document.createElement('xe-icon');
    icon.setAttribute('slot', 'icon');
    icon.setAttribute('icon', iconName);
    icon.setAttribute('size', 'lg');
    column.append(icon);
  }

  // --- Heading ---
  if (headingEl && headingEl.textContent.trim()) {
    const heading = document.createElement(`h${level}`);
    heading.setAttribute('slot', 'heading');
    heading.textContent = headingEl.textContent.trim();
    moveInstrumentation(headingEl, heading);
    column.append(heading);
  }

  // --- Message (rich text: keep the authored paragraphs/inline markup) ---
  if (messageCell) {
    const message = document.createElement('div');
    message.setAttribute('slot', 'message');
    moveInstrumentation(messageCell, message);
    message.append(...messageCell.childNodes);
    column.append(message);
  }

  // --- Action ---
  const label = linkEl ? linkEl.textContent.trim() : '';
  if (label) {
    const button = document.createElement('xe-button');
    button.setAttribute('slot', 'action');
    button.setAttribute('variant', 'primary');
    button.setAttribute('treatment', 'outlined');
    button.setAttribute('size', 'sm');
    const href = linkEl.getAttribute('href');
    if (href) button.setAttribute('href', href);
    moveInstrumentation(linkEl, button);

    const arrow = document.createElement('xe-icon');
    arrow.setAttribute('slot', 'trailing-icon');
    arrow.setAttribute('size', 'sm');
    arrow.setAttribute('icon', 'faArrowRight');

    button.append(label, arrow);
    column.append(button);
  }

  block.textContent = '';
  block.append(banner);
}
