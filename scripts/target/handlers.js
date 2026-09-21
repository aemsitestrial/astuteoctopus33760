/*
 * Form-Based / JSON offer handlers.
 *
 * A handler reads a scope's JSON offer and writes it to stable, post-decoration
 * anchors, returning `true` once fully applied so it runs only once as blocks
 * decorate. `blockHandler`/`itemHandler` remove per-block boilerplate; the
 * FORM_BASED_HANDLERS registry has one entry per scope (keyed by block name),
 * and FORM_BASED_SCOPES is derived from its keys so adding a handler also
 * requests its scope.
 */

import {
  getBlocks, pickBlock, findItem, setText, applyFields, applyInstructions,
} from './dom.js';
import { HERO_V3_FIELDS, XE_HERO_FIELDS, HEADING } from './fields.js';

// Convenience: block-level handler that applies `set` fields to the picked block.
export function blockHandler(blockClass, fieldMap) {
  return (content) => applyInstructions(content, (match, set) => applyFields(
    pickBlock(getBlocks(blockClass), match),
    set,
    fieldMap,
  ));
}

// Convenience: item-collection handler. `match` picks the block, then a repeated
// item within it (by `match.item` text against labelSelector), and `set` fields
// are applied to that item.
export function itemHandler(blockClass, itemSelector, labelSelector, fieldMap) {
  return (content) => applyInstructions(content, (match, set) => applyFields(
    findItem(pickBlock(getBlocks(blockClass), match), itemSelector, labelSelector, match.item),
    set,
    fieldMap,
  ));
}

/**
 * Handler for "default content" — loose paragraphs, headings and lists authored
 * directly in a section (EDS wraps them in `.default-content-wrapper`), NOT inside
 * a block. These carry no block class, labels or ids, so we anchor by the element's
 * current text, optionally scoped to a wrapper.
 *
 * Each instruction:
 *   match.text     → element (p, h1-6, li) whose trimmed text equals this — required
 *   match.wrapper  → zero-based index of the main `.default-content-wrapper` to
 *                    search (omit to search all default-content in <main>)
 *   set.text       → the replacement text
 *
 *   { "items": [ { "match": { "text": "This is a sample text block" },
 *                  "set":   { "text": "Personalized intro — Experience A" } } ] }
 *
 * Scoped to <main> so header/footer default content is never matched.
 */
function defaultContentElements(wrapperIndex) {
  const main = document.querySelector('main');
  if (!main) return [];
  const wrappers = [...main.querySelectorAll('.default-content-wrapper')];
  const scope = typeof wrapperIndex === 'number' ? [wrappers[wrapperIndex]] : wrappers;
  return scope
    .filter(Boolean)
    .flatMap((w) => [...w.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')]);
}

function defaultContentHandler() {
  return (content) => applyInstructions(content, (match, set) => {
    if (!match.text || typeof set.text !== 'string') return false;
    const el = defaultContentElements(match.wrapper)
      .find((e) => e.textContent.trim() === match.text);
    return setText(el, set.text);
  });
}

// Scope names that resolve to a composite handler — skipped when a composite
// dispatches, so one composite can never recurse into another (or itself).
const COMPOSITE_SCOPES = new Set();

/**
 * Composite handler: a single offer/scope drives several block types at once.
 * The offer's `content.blocks` maps each block/scope name to that block's own
 * offer shape, which is dispatched to its existing handler, e.g.
 *   {
 *     "blocks": {
 *       "hero":    { "set": { "heading": "..." } },
 *       "metrics": { "items": [ { "match": { "item": "..." }, "set": { "value": "..." } } ] }
 *     }
 *   }
 * Returns true only when every listed block applied (so the scope stops retrying).
 */
function compositeHandler() {
  return (content) => {
    const blocks = content.blocks || {};
    const keys = Object.keys(blocks).filter((k) => !COMPOSITE_SCOPES.has(k));
    if (!keys.length) return false;
    const applied = keys.filter((key) => {
      // FORM_BASED_HANDLERS is defined below; only read at runtime, so this is safe.
      // eslint-disable-next-line no-use-before-define
      const handler = FORM_BASED_HANDLERS[key];
      return handler ? handler(blocks[key]) : false;
    }).length;
    return applied === keys.length;
  };
}

/**
 * One handler per content block. Anchors are the post-decoration class names each
 * block produces (see blocks/<name>/<name>.js), which are stable across reloads.
 * `set` field names are the personalizable slots; author your Target JSON offer
 * to match them.
 */
export const FORM_BASED_HANDLERS = {
  // --- Header / banner style blocks (block-level fields) ---
  hero: blockHandler('hero', {
    badge: '.hero-badge',
    heading: '.hero-heading h1, .hero-heading h2, .hero-heading h3',
    subtitle: '.hero-subtitle',
    primaryCta: '.hero-actions a.hero-btn-primary',
    secondaryCta: '.hero-actions a.hero-btn-ghost',
  }),
  // hero-v3: clean inline hero. Fields are the block's model properties
  // (title/subtitle/primaryCta/secondaryCta), mapped to the classes hero-v3.js
  // emits. See HERO_V3_FIELDS.
  'hero-v3': blockHandler('hero-v3', HERO_V3_FIELDS),
  // xe-hero: web-component hero. Same model fields as hero-v3, anchored to the
  // slotted light-DOM elements xe-hero.js emits. See XE_HERO_FIELDS.
  'xe-hero': blockHandler('xe-hero', XE_HERO_FIELDS),
  'feature-cards': blockHandler('feature-cards', {
    label: '.feature-cards-label',
    heading: '.feature-cards-title',
    subtitle: '.feature-cards-subtitle',
  }),
  'usage-dashboard': blockHandler('usage-dashboard', {
    heading: (b) => b.querySelector(`.usage-promo ${HEADING}`),
    label: '.usage-promo .usage-label',
    cta: '.usage-promo a.usage-cta',
  }),
  'cta-band': blockHandler('cta-band', {
    heading: '.cta-band-title',
    subtitle: '.cta-band-sub',
    cta: '.cta-band-actions a.cta-band-btn',
  }),
  'page-header': blockHandler('page-header', {
    label: '.page-header-label',
    heading: (b) => b.querySelector(`.page-header-title ${HEADING}`),
    subtitle: '.page-header-subtitle',
  }),
  'about-hero': blockHandler('about-hero', {
    label: '.about-hero-intro .about-hero-label',
    heading: (b) => b.querySelector(`.about-hero-intro ${HEADING}`),
  }),
  'area-finder': blockHandler('area-finder', {
    heading: '.geo-panel-title',
  }),
  'contact-methods': blockHandler('contact-methods', {
    heading: '.contact-methods-title',
  }),
  'contact-form': blockHandler('contact-form', {
    heading: '.contact-form-title',
  }),
  'outage-banner': blockHandler('outage-banner', {
    message: '.outage-banner-content',
  }),
  columns: blockHandler('columns', {
    heading: HEADING,
  }),

  // --- Item-collection blocks (match a row/card by its text, then set fields) ---
  metrics: itemHandler('metrics', '.metrics-item', '.metrics-label', {
    value: '.metrics-value',
    label: '.metrics-label',
    change: '.metrics-change',
  }),
  stats: itemHandler('stats', '.stats-item', '.stats-label', {
    value: '.stats-value',
    label: '.stats-label',
  }),
  team: itemHandler('team', '.team-card', '.team-name', {
    name: '.team-name',
    role: '.team-role',
  }),
  timeline: itemHandler('timeline', '.tl-item', '.tl-year', {
    year: '.tl-year',
    heading: '.tl-title',
    description: '.tl-desc',
  }),
  values: itemHandler('values', '.value-item', '.value-title', {
    heading: '.value-title',
    description: '.value-desc',
  }),
  'pricing-plans': itemHandler('pricing-plans', '.plan-card', '.plan-name', {
    name: '.plan-name',
    price: '.plan-price',
    cta: 'a.button, .plan-cta',
  }),
  cards: itemHandler('cards', ':scope > ul > li', HEADING, {
    heading: HEADING,
    body: '.cards-card-body p',
  }),
  'job-listings': itemHandler('job-listings', '.job-card', '.job-title', {
    title: '.job-title',
    description: '.job-desc',
  }),

  // --- Default content (loose paragraphs/headings/lists, not in a block) ---
  'default-content': defaultContentHandler(),

  // --- Composite: one offer that drives several blocks at once (see compositeHandler) ---
  // NOTE: Intent Sections are not listed here — each is exposed as its own
  // decision scope named after its id (see getSectionScopes / sectionScopeHandler).
  page: compositeHandler(),
};

// Mark composite scopes so a composite offer never dispatches into another composite.
['page'].forEach((s) => COMPOSITE_SCOPES.add(s));

// Request only the scopes we can actually handle. Extend by adding a handler above.
export const FORM_BASED_SCOPES = Object.keys(FORM_BASED_HANDLERS);
