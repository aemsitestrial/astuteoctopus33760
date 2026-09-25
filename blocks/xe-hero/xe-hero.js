import { moveInstrumentation } from '../../scripts/scripts.js';
import '../../scripts/components/xe-button.js';

/*
 * XE Hero
 *
 * decorate() rebuilds the authored EDS table rows into web-component semantics,
 * following the same shadow-DOM approach as xe-ignite-feature-cards.js:
 *
 *   <xe-hero align="center">
 *     <img slot="media" src="…" alt="…">
 *     <h1 slot="title">…</h1>
 *     <p slot="subtitle">…</p>
 *     <div slot="actions">
 *       <xe-button variant="primary" treatment="filled" href="…">…</xe-button>
 *       <xe-button variant="secondary" treatment="outline" href="…">…</xe-button>
 *     </div>
 *   </xe-hero>
 *
 * The `slot` attributes and the align/height presets only mean something inside
 * real custom elements, so <xe-hero> is defined below as a small shadow-DOM
 * component; <xe-button> is shared with the other xe-* blocks
 * (scripts/components). The media renders full-bleed behind a scrim; title,
 * subtitle, and actions render on top through named slots.
 */

const SCRIM = 'linear-gradient(180deg, rgb(0 0 0 / 55%) 0%, rgb(0 0 0 / 65%) 100%)';

// Maps the six locked-preset variant classes (see _xe-hero.json "classes"
// field) to their fixed configuration: named variants make Height/Text
// Alignment non-author-editable, so the values are resolved from the variant
// identity rather than from authored fields.
const VARIANT_PRESETS = {
  'tall-center-with-action': { height: 'tall', align: 'center' },
  'tall-left-with-actions': { height: 'tall', align: 'left' },
  'standard-center-with-actions': { height: 'standard', align: 'center' },
  'standard-left-with-actions': { height: 'standard', align: 'left' },
  'compact-center-with-actions': { height: 'compact', align: 'center' },
  'compact-left-with-actions': { height: 'compact', align: 'left' },
};

/**
 * <xe-hero> — full-bleed hero. Renders a media layer (default `media` slot)
 * behind a scrim, with title/subtitle/actions stacked on top. Height is driven
 * by the `height` attribute; horizontal alignment by `align`.
 */
class XeHero extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const align = this.getAttribute('align') || 'center';
    root.innerHTML = `
      <style>
        :host {
          position: relative;
          display: flex;
          overflow: hidden;
          background-color: #1b1b1b;
          min-height: var(--hero-min-height, clamp(18rem, 55vw, 32rem));
          color: #fff;
        }
        :host([height="tall"]) { --hero-min-height: 34rem; }
        :host([height="standard"]) { --hero-min-height: 24rem; }
        :host([height="compact"]) { --hero-min-height: 16rem; }
        .media {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: ${SCRIM};
        }
        ::slotted([slot="media"]) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          max-width: 40rem;
          margin-inline: auto;
          padding: 2rem 1.25rem;
          text-align: ${align};
          align-items: ${align === 'left' ? 'flex-start' : 'center'};
        }
        :host([align="left"]) .content { margin-inline: 0; }
        ::slotted([slot="title"]) {
          margin: 0;
          font-family: var(--heading-font-family);
          font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
          line-height: 1.15;
          font-weight: 700;
        }
        ::slotted([slot="subtitle"]) {
          margin: 0;
          font-size: clamp(1rem, 1vw + 0.85rem, 1.25rem);
          line-height: 1.5;
          max-width: 38ch;
        }
        ::slotted([slot="actions"]) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        @media (width >= 600px) {
          .content { padding: 3rem 2.5rem; }
        }
      </style>
      <div class="media"><slot name="media"></slot></div>
      <div class="content">
        <slot name="title"></slot>
        <slot name="subtitle"></slot>
        <slot name="actions"></slot>
      </div>
    `;
  }
}

// Register once — the block can be decorated multiple times per page.
// <xe-button> is shared with the other xe-* blocks (scripts/components).
if (!customElements.get('xe-hero')) customElements.define('xe-hero', XeHero);

/**
 * Resolves the effective height/alignment for this block instance: a locked
 * variant preset wins over the default (author-controlled) layout.
 */
function resolveLayoutConfig(block) {
  const presetKey = Object.keys(VARIANT_PRESETS).find((key) => block.classList.contains(key));
  if (presetKey) return VARIANT_PRESETS[presetKey];
  return { height: 'responsive', align: 'center' };
}

export default function decorate(block) {
  const rows = [...block.children];
  const { height, align } = resolveLayoutConfig(block);

  // Classify authored rows positionally: image row (has a picture/img), action
  // rows (have links), and the remaining text rows — in document order, the
  // title then the subtitle (model field order in _xe-hero.json).
  let imageEl = null;
  const anchorEls = [];
  const textCells = [];

  rows.forEach((row) => {
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    if (!imageEl && cell.querySelector('img')) {
      imageEl = cell.querySelector('img');
      return;
    }
    const cellAnchors = [...cell.querySelectorAll('a')];
    if (cellAnchors.length) {
      anchorEls.push(...cellAnchors);
      return;
    }
    if (cell.textContent.trim()) textCells.push(cell);
  });

  const hero = document.createElement('xe-hero');
  hero.className = 'xe-hero-banner';
  hero.setAttribute('align', align);
  if (height !== 'responsive') hero.setAttribute('height', height);

  // --- Media ---
  if (imageEl) {
    const img = document.createElement('img');
    img.setAttribute('slot', 'media');
    img.setAttribute('src', imageEl.getAttribute('src') || '');
    img.setAttribute('alt', (imageEl.getAttribute('alt') || '').trim());
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
    hero.append(img);
  }

  // --- Title (first text row) ---
  const [titleCell, subtitleCell] = textCells;
  if (titleCell) {
    const title = document.createElement('h1');
    title.setAttribute('slot', 'title');
    title.textContent = titleCell.textContent.trim();
    moveInstrumentation(titleCell, title);
    hero.append(title);
  }

  // --- Subtitle (second text row) ---
  if (subtitleCell) {
    const subtitle = document.createElement('p');
    subtitle.setAttribute('slot', 'subtitle');
    subtitle.textContent = subtitleCell.textContent.trim();
    moveInstrumentation(subtitleCell, subtitle);
    hero.append(subtitle);
  }

  // --- Actions (up to two CTAs) ---
  const links = anchorEls.slice(0, 2);
  if (links.length) {
    const actions = document.createElement('div');
    actions.setAttribute('slot', 'actions');

    links.forEach((link, index) => {
      const button = document.createElement('xe-button');
      if (index === 0) {
        button.setAttribute('variant', 'primary');
        button.setAttribute('treatment', 'filled');
      } else {
        button.setAttribute('variant', 'secondary');
        button.setAttribute('treatment', 'outline');
      }
      const href = link.getAttribute('href');
      if (href) button.setAttribute('href', href);
      button.textContent = link.textContent.trim();
      actions.append(button);
    });

    hero.append(actions);
  }

  block.textContent = '';
  block.append(hero);
}
