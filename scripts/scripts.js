import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  toClassName,
  getMetadata,
} from './aem.js';
import { alloyLoadedPromise } from './target.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * Loads and caches the site config sheet (/config.json) as a key -> value map.
 * The config sheet holds environment-specific values (e.g. the Content
 * Fragment GraphQL endpoint) so they are never hardcoded in block code.
 * @returns {Promise<Object>} map of config key to string value
 */
let configPromise;
export async function getSiteConfig() {
  if (!configPromise) {
    configPromise = (async () => {
      try {
        const resp = await fetch(`${window.hlx.codeBasePath}/config.json`);
        if (!resp.ok) return {};
        const json = await resp.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        return rows.reduce((acc, row) => {
          if (row?.key) acc[row.key] = row.value ?? '';
          return acc;
        }, {});
      } catch (e) {
        return {};
      }
    })();
  }
  return configPromise;
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Promotes a section's authored `id` field to a real `id` attribute on the
 * section element. decorateSections() reads the section-metadata `id` field
 * into `section.dataset.id`; this also exposes it as a DOM id so it works as a
 * CSS hook and a fragment/anchor-link target (e.g. #hero-intent). The
 * data-id attribute is preserved (Adobe Target matches on it). Skips missing
 * ids and avoids creating duplicate ids on the page.
 * @param {Element} main The main element
 */
function decorateSectionIds(main) {
  const used = new Set([...document.querySelectorAll('[id]')].map((el) => el.id));
  main.querySelectorAll(':scope > .section').forEach((section) => {
    const id = toClassName(section.dataset.id || '');
    if (!id || section.id || used.has(id)) return;
    section.id = id;
    used.add(id);
  });
}

/**
 * Auto-generates a stable `id` on every child block of a top-level section,
 * following the pattern `[section-id-or-name]-[block-name]-[iteration]`:
 *
 *   hero-intent-hero-v3          (first hero-v3 in section "hero-intent")
 *   hero-intent-feature-cards    (first feature-cards in the same section)
 *   hero-intent-hero-v3-2        (a second hero-v3 in the same section)
 *
 * The iteration suffix only appears when a block type repeats inside the same
 * section (the first occurrence is left unsuffixed for clean ids). The prefix is
 * the section's real `id` (set by decorateSectionIds for Intent Sections) when
 * present, otherwise its normalized Section Name (section.dataset.name) — so
 * sections that only carry a name still get stable block ids.
 *
 * These ids give Adobe Target (and CSS/anchors) a position-independent handle on
 * an individual block inside a section — see applyBlocksToSection in target.js,
 * which can address a specific iteration by its generated id. Runs AFTER
 * decorateBlocks() so `data-block-name` is populated. Never overwrites an id an
 * author or other code already set, and de-duplicates against every id on the
 * page.
 * @param {Element} main The main element
 */
function decorateIntentSectionBlockIds(main) {
  const used = new Set([...document.querySelectorAll('[id]')].map((el) => el.id));
  main.querySelectorAll(':scope > .section').forEach((section) => {
    // Prefer the section's real id; fall back to its normalized name.
    const prefix = section.id || toClassName(section.dataset.name || '');
    if (!prefix) return;
    // Iteration counter per block type, scoped to this section.
    const counts = new Map();
    section.querySelectorAll(':scope .block[data-block-name]').forEach((block) => {
      const { blockName } = block.dataset;
      if (!blockName || block.id) return; // keep any id already present
      const n = (counts.get(blockName) || 0) + 1;
      counts.set(blockName, n);
      // First occurrence: no suffix; repeats: -2, -3, … Bump further on any
      // page-wide collision so generated ids stay unique.
      let iteration = n;
      let id = iteration === 1 ? `${prefix}-${blockName}` : `${prefix}-${blockName}-${iteration}`;
      while (used.has(id)) {
        iteration += 1;
        id = `${prefix}-${blockName}-${iteration}`;
      }
      block.id = id;
      used.add(id);
    });
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionIds(main);
  decorateBlocks(main);
  decorateIntentSectionBlockIds(main);
}

// Adobe Target / WebSDK integration lives in ./target.js. Importing it configures
// alloy immediately; alloyLoadedPromise resolves once alloy is ready and is awaited
// in loadEager so personalization can run before first paint.

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    // await loadSection(main.querySelector('.section'), waitForFirstImage);

    // Wait for alloy to configure — happens before first paint
    await alloyLoadedPromise;

    // Break up long tasks to reduce TBT before showing LCP block
    await new Promise((res) => {
      window.setTimeout(async () => {
        // Newer boilerplate:
        await loadSection(main.querySelector('.section'), waitForFirstImage);
        // Older boilerplate — use this instead:
        // await waitForLCP(LCP_BLOCKS);
        res();
      }, 0);
    });
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // When the page being viewed/edited IS the header or footer fragment itself
  // (e.g. authoring the footer document in the Universal Editor), don't also
  // inject that fragment into the chrome — it would render the content twice
  // and confuse the author. Skip if the current path matches the resolved
  // fragment path, OR just its basename (covers language-master variants like
  // /language-masters/en/xe-footer where per-page metadata may be absent).
  const currentPath = window.location.pathname.replace(/\.html$/, '');
  const basename = currentPath.split('/').pop();
  const resolvePath = (meta, fallback) => (
    meta ? new URL(meta, window.location).pathname : fallback
  );
  const isFragmentPage = (fragmentPath) => currentPath === fragmentPath
    || basename === fragmentPath.split('/').pop();

  const footerPath = resolvePath(getMetadata('footer'), '/xe-footer');
  const headerPath = resolvePath(getMetadata('nav'), '/nav');

  if (!isFragmentPage(headerPath)) loadHeader(doc.querySelector('header'));
  if (!isFragmentPage(footerPath)) loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
