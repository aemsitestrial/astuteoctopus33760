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

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

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
