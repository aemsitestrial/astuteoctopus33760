/*
 * Loader for the @ignite/web component bundles (scripts/ignite/bundle).
 *
 *   import loadIgnite from '../../scripts/components/ignite.js';
 *   loadIgnite(() => import('../../scripts/ignite/bundle/compositions/footer/xe-footer.js'));
 *
 * Every Ignite bundle inlines its own copy of the primitives it uses (xe-icon,
 * xe-hyperlink, …) and registers them with an unguarded
 * customElements.define(), so a second bundle — or the local <xe-icon> already
 * on the page — would make the next registration throw and abort the whole
 * bundle. Before any bundle loads this module:
 *
 *   - registers the local <xe-icon> first, so every xe-icon on the page
 *     (including the ones Ignite renders inside its shadow roots, e.g. the
 *     accordion chevron) resolves from the same icon set;
 *   - makes customElements.define() skip names that are already registered
 *     instead of throwing (first registration wins);
 *   - loads the Ignite design tokens (tokens.css: the --xe-* custom properties
 *     the components read, without the theme's global element resets).
 */

import './xe-icon.js';

if (!customElements.xeSkipsDuplicates) {
  const define = customElements.define.bind(customElements);
  customElements.define = (name, constructor, options) => {
    if (customElements.get(name)) return;
    define(name, constructor, options);
  };
  customElements.xeSkipsDuplicates = true;
}

const TOKENS_HREF = new URL('../ignite/bundle/themes/tokens.css', import.meta.url).href;

function loadTokens() {
  if (document.querySelector(`link[href="${TOKENS_HREF}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = TOKENS_HREF;
  document.head.append(link);
}

/**
 * Loads an Ignite bundle. Load failures resolve to `null` so a block can keep
 * its fallback rendering rather than break the page.
 * @param {() => Promise<object>} importBundle e.g. `() => import('…/xe-footer.js')`
 * @returns {Promise<object|null>} the bundle's module namespace, or null
 */
export default function loadIgnite(importBundle) {
  loadTokens();
  return importBundle().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to load Ignite components', error);
    return null;
  });
}
