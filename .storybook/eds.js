/*
 * Test harness that reproduces the DOM AEM Edge Delivery Services builds around
 * a block, so a block's `decorate()` runs in Storybook exactly as it does on the
 * live site.
 *
 * At runtime EDS wraps every block like this:
 *
 *   <main>
 *     <div class="section">
 *       <div class="<name>-wrapper">
 *         <div class="<name> block">   <- decorate() receives this element
 *           <div>                       <- a row
 *             <div>...</div>            <- a cell
 *           </div>
 *           ...
 *         </div>
 *       </div>
 *     </div>
 *   </main>
 *
 * Block stylesheets frequently target that full chain (xe-footer's CSS scopes
 * `main > .section > .xe-footer-wrapper`), so the harness builds the whole
 * structure rather than just the block element.
 */

const loadedStyles = new Set();

// Resolve every block stylesheet through Vite (as an asset URL) at build time.
// This is deliberately NOT a `/blocks/...` static path: the story modules live
// under `blocks/`, and mapping that dir as a staticDir would shadow Vite's
// module transform for the stories themselves (serving them raw, so bare
// imports like `storybook/test` reach the browser unrewritten and the story
// renders empty). Going through Vite keeps stories on the real shipped CSS in
// both dev and build without that collision.
const blockCSS = import.meta.glob('/blocks/*/*.css', {
  query: '?url',
  import: 'default',
  eager: true,
});

/**
 * Inject a block's real stylesheet — the same file the site ships — via a
 * Vite-resolved URL.
 */
function loadBlockCSS(name) {
  const href = blockCSS[`/blocks/${name}/${name}.css`];
  if (!href || loadedStyles.has(href)) return;
  loadedStyles.add(href);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

/**
 * Build the block element (`<div class="<name> block">`) and its authored
 * rows/cells from a nested array. Each row is an array of cells; each cell is
 * an HTML string (what an author would put in one table cell).
 *
 * @param {string} name block name, e.g. 'xe-footer'
 * @param {string[][]} rows rows -> cells (HTML strings)
 * @param {string[]} [variants] extra block classes (block variants)
 */
export function buildBlock(name, rows, variants = []) {
  const block = document.createElement('div');
  block.className = [name, 'block', ...variants].join(' ');
  block.dataset.blockName = name;
  block.dataset.blockStatus = 'loaded';

  rows.forEach((cells) => {
    const row = document.createElement('div');
    cells.forEach((cellHtml) => {
      const cell = document.createElement('div');
      cell.innerHTML = cellHtml;
      row.append(cell);
    });
    block.append(row);
  });

  return block;
}

/**
 * Render a block for a story: build the EDS wrapper chain, load the block CSS,
 * run its decorate function, and return the `<main>` element for Storybook to
 * mount.
 *
 * @param {object} opts
 * @param {string} opts.name block name
 * @param {string[][]} opts.rows authored rows -> cells (HTML strings)
 * @param {(block: HTMLElement) => void} opts.decorate the block's default export
 * @param {string[]} [opts.variants] extra block classes
 * @returns {HTMLElement}
 */
export function renderBlock({
  name, rows, decorate, variants = [],
}) {
  loadBlockCSS(name);

  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';
  const wrapper = document.createElement('div');
  wrapper.className = `${name}-wrapper`;

  const block = buildBlock(name, rows, variants);
  wrapper.append(block);
  section.append(wrapper);
  main.append(section);

  // decorate() may be async (loads sub-resources); the sync DOM mutations it
  // performs first are enough for a static story render.
  decorate(block);

  return main;
}

/**
 * Convenience: a `<picture>` matching EDS's optimized-image markup, so image
 * rows in stories look like the real authored output.
 */
export function picture(src, alt = '') {
  return `<picture><img src="${src}" alt="${alt}" loading="eager"></picture>`;
}
