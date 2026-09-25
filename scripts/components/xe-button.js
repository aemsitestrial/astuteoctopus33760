/*
 * <xe-button> — shared CTA web component used by the xe-* blocks.
 *
 *   <xe-button variant="primary" treatment="outlined" size="sm" href="…">
 *     Label<xe-icon slot="trailing-icon" icon="faArrowRight" size="sm"></xe-icon>
 *   </xe-button>
 *
 * Renders an anchor when it carries an href so the CTA still navigates;
 * otherwise a plain button. Variant picks the color, treatment picks
 * filled vs. outlined ("outline" is accepted as an alias). Colors come from
 * inheritable custom properties so each block can theme its buttons without
 * redefining the element:
 *
 *   --xe-button-primary        primary color      (default #0b3d91)
 *   --xe-button-on-primary     text on filled primary (default #fff)
 *   --xe-button-secondary      secondary color    (default #fff)
 *   --xe-button-on-secondary   text on filled secondary (default #1b1b1b)
 *   --xe-button-font-family    label font (default the heading font)
 *
 * Blocks import this module for its side effect; the element is registered once
 * no matter how many blocks on the page use it.
 */

const STYLES = `
  :host {
    display: inline-block;
    --_color: var(--xe-button-primary, #0b3d91);
    --_on-color: var(--xe-button-on-primary, #fff);
  }
  :host([variant="secondary"]) {
    --_color: var(--xe-button-secondary, #fff);
    --_on-color: var(--xe-button-on-secondary, #1b1b1b);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.65rem 1.5rem;
    border-radius: 0.25rem;
    font-family: var(--xe-button-font-family, var(--heading-font-family));
    font-size: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: 2px solid transparent;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  :host([size="sm"]) .btn {
    box-sizing: border-box;
    border-width: 1px;
    padding: 0.75rem 1rem;
    font-size: 1.0625rem;
  }
  :host([treatment="filled"]) .btn {
    background: var(--_color);
    color: var(--_on-color);
  }
  :host([treatment="filled"]) .btn:hover,
  :host([treatment="filled"]) .btn:focus {
    background: color-mix(in srgb, var(--_color) 85%, black);
  }
  :host([treatment="outlined"]) .btn,
  :host([treatment="outline"]) .btn {
    background: transparent;
    color: var(--_color);
    border-color: var(--_color);
  }
  :host([treatment="outlined"]) .btn:hover,
  :host([treatment="outlined"]) .btn:focus,
  :host([treatment="outline"]) .btn:hover,
  :host([treatment="outline"]) .btn:focus {
    background: color-mix(in srgb, var(--_color) 15%, transparent);
  }
  ::slotted([slot="trailing-icon"]) {
    flex-shrink: 0;
  }
`;

class XeButton extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const href = this.getAttribute('href');

    const style = document.createElement('style');
    style.textContent = STYLES;

    const btn = document.createElement(href ? 'a' : 'button');
    btn.className = 'btn';
    if (href) btn.setAttribute('href', href);
    else btn.setAttribute('type', 'button');
    btn.innerHTML = '<slot></slot><slot name="trailing-icon"></slot>';

    root.append(style, btn);
  }
}

if (!customElements.get('xe-button')) customElements.define('xe-button', XeButton);
