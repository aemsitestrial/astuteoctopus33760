/*
 * <xe-icon> — shared inline-SVG icon web component used by the xe-* blocks.
 *
 *   <xe-icon icon="faLeaf" size="lg"></xe-icon>
 *
 * `icon` takes a Font Awesome-style name from ./icons.js; `size` is sm, md
 * (default) or lg. The glyph uses `currentColor`, so it follows the text color
 * it sits in. Icons are decorative (aria-hidden) unless a `label` attribute is
 * given, in which case the icon is exposed as an image with that name.
 */

import ICONS from './icons.js';

const SIZES = { sm: '1em', md: '1.5rem', lg: '2rem' };

class XeIcon extends HTMLElement {
  static get observedAttributes() { return ['icon', 'size', 'label']; }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  render() {
    const [width, height, path] = ICONS[this.getAttribute('icon')] || [];
    const size = SIZES[this.getAttribute('size')] || SIZES.md;
    const label = this.getAttribute('label');

    if (label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', label);
      this.removeAttribute('aria-hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; line-height: 0; }
        svg { width: ${size}; height: ${size}; fill: currentColor; }
      </style>
      ${path ? `<svg viewBox="0 0 ${width} ${height}" focusable="false"><path d="${path}"></path></svg>` : ''}
    `;
  }
}

if (!customElements.get('xe-icon')) customElements.define('xe-icon', XeIcon);
