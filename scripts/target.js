import { getMetadata } from './aem.js';

/*
 * Adobe Target integration for AEM Edge Delivery Services.
 *
 * Form-Based / JSON offers only: Target returns a JSON blob per decision scope
 * and this module applies it to stable, post-decoration anchors (see
 * FORM_BASED_HANDLERS). There is no VEC / dom-action support — VEC selectors are
 * captured against a single DOM snapshot and do not survive EDS decoration, so
 * form-based offers are the supported path on EDS.
 *
 * Intent Sections get their own decision scope named after the section id, so
 * one section can be personalized with a blocks-only offer (see getSectionScopes
 * / sectionScopeHandler).
 *
 * Flicker is handled by pre-hiding the containers a scope may replace and
 * revealing each (with a short fade-in) once its offer applies (see the Flicker
 * control section).
 *
 * EDS load phasing (Eager / Lazy / Delayed):
 *  - Eager: alloy is CONFIGURED (loadEager awaits alloyLoadedPromise) and the
 *    decision request is fired immediately — decisions must be in flight as
 *    early as possible to minimize flicker. We never block first paint on the
 *    Target round-trip (renderDecisions:false; offers applied asynchronously).
 *  - Eager → Lazy: offers are applied progressively via onDecoratedElement as
 *    each section/block decorates (first section in eager, the rest in lazy).
 *  - Deferred: proposition-display reporting is pushed off the critical path
 *    with setTimeout so it never competes with LCP work.
 * Do NOT `await` the decision response inside loadEager — that would stall
 * first paint on the network; the flicker control covers the gap instead.
 *
 * See docs/adobe-target-form-based.md for the JSON offer contract, the
 * multi-instance `items`/`match`/`set` model, and how to add new experiences.
 */

// --- Datastream configuration ------------------------------------------------

const WEBSDK_CONFIG = {
  datastreamId: 'd7e718aa-3cf8-429f-bc60-9921cdbed6cc',
  orgId: '0CEB60F754C7E06B0A4C98A2@AdobeOrg',
};

const JSON_CONTENT_ITEM_SCHEMA = 'https://ns.adobe.com/personalization/json-content-item';

// --- WebSDK (alloy) bootstrap ------------------------------------------------

function initWebSDK(path, config) {
  // Preparing the alloy queue
  if (!window.alloy) {
    // eslint-disable-next-line no-underscore-dangle
    (window.__alloyNS ||= []).push('alloy');
    window.alloy = (...args) => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        window.alloy.q.push([resolve, reject, args]);
      });
    });
    window.alloy.q = [];
  }
  // Loading and configuring the websdk
  return new Promise((resolve) => {
    import(path)
      .then(() => window.alloy('configure', config))
      .then(resolve);
  });
}

// --- Decoration observer ------------------------------------------------------

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
      || m.target.dataset.sectionStatus === 'loaded'
      || m.target.dataset.blockStatus === 'loaded')) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), { childList: true });
}

// --- Form-Based / JSON offer helpers -----------------------------------------

// All instances of a block on the page, e.g. getBlocks('metrics').
function getBlocks(blockClass) {
  return [...document.querySelectorAll(`.${blockClass}`)];
}

/**
 * Picks a single block instance using a match descriptor:
 *  - match.key      → block whose `data-target-key` attribute equals key
 *                     (author this in UE as a stable, position-independent id)
 *  - match.instance → zero-based index into the list
 *  - default        → the first instance
 */
function pickBlock(blocks, match = {}) {
  if (match.key) return blocks.find((b) => b.dataset.targetKey === match.key) || null;
  if (typeof match.instance === 'number') return blocks[match.instance] || null;
  return blocks[0] || null;
}

/**
 * Finds a repeated item inside a block (a metric, team card, plan…) by the text
 * of one of its child elements — position-independent. Falls back to the first
 * item when no label is supplied.
 */
function findItem(block, itemSelector, labelSelector, labelText) {
  if (!block) return null;
  const items = [...block.querySelectorAll(itemSelector)];
  if (!labelText) return items[0] || null;
  return items.find(
    (it) => it.querySelector(labelSelector)?.textContent.trim() === labelText,
  ) || null;
}

// Sets textContent (preserving surrounding instrumentation) when both exist.
function setText(el, value) {
  if (el && typeof value === 'string') {
    el.textContent = value;
    return true;
  }
  return false;
}

/**
 * Applies each field in `set` to `container` via a fieldMap of
 * { fieldName: cssSelector | (container) => element }. Unknown fields are
 * ignored. Returns true only when every recognised field applied, so the scope
 * stops retrying on later decoration passes.
 */
function applyFields(container, set, fieldMap) {
  if (!container || !set) return false;
  let total = 0;
  let applied = 0;
  Object.entries(set).forEach(([field, value]) => {
    const resolver = fieldMap[field];
    if (!resolver) return; // ignore fields this block does not expose
    total += 1;
    const el = typeof resolver === 'function' ? resolver(container) : container.querySelector(resolver);
    if (setText(el, value)) applied += 1;
  });
  return total > 0 && applied === total;
}

/**
 * Normalises a JSON offer to a list of { match, set } instructions and applies
 * each via applyOne. Returns true only when every instruction applied.
 *
 * Accepts either a multi-instance array (`{ items: [{ match, set }] }`) or a
 * flat single-instance offer (`{ set: {...} }` or the bare field object).
 */
function applyInstructions(content, applyOne) {
  const items = Array.isArray(content.items)
    ? content.items
    : [{ match: content.match || {}, set: content.set || content }];
  if (!items.length) return false;
  const applied = items.filter((it) => applyOne(it.match || {}, it.set || {})).length;
  return applied === items.length;
}

// Convenience: block-level handler that applies `set` fields to the picked block.
function blockHandler(blockClass, fieldMap) {
  return (content) => applyInstructions(content, (match, set) => applyFields(
    pickBlock(getBlocks(blockClass), match),
    set,
    fieldMap,
  ));
}

// Convenience: item-collection handler. `match` picks the block, then a repeated
// item within it (by `match.item` text against labelSelector), and `set` fields
// are applied to that item.
function itemHandler(blockClass, itemSelector, labelSelector, fieldMap) {
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

// hero-v3 personalizable fields, keyed by the block's MODEL property names
// (blocks/hero-v3/_hero-v3.json) → the post-decoration selector each maps to.
// Shared by the `hero-v3` block handler and the `intent-section` handler so the
// offer field names match what an author sees in the model. `heading` is kept
// as a back-compat alias for `title`.
const HERO_V3_FIELDS = {
  title: '.hero-title',
  heading: '.hero-title',
  subtitle: '.hero-subtitle',
  primaryCta: '.hero-actions a.hero-action-primary',
  secondaryCta: '.hero-actions a.hero-action-static-light',
};

// Blocks that can be personalized inside an Intent Section, keyed by the name
// used in the offer's `blocks` entries → the block's selector within the
// section and its field map. `hero` is an author-friendly alias for `hero-v3`
// (the only hero the section allows).
const INTENT_SECTION_BLOCKS = {
  'hero-v3': { selector: '.hero-v3', fields: HERO_V3_FIELDS },
  hero: { selector: '.hero-v3', fields: HERO_V3_FIELDS },
};

/*
 * Intent Section personalization — a composite scoped to a single section.
 *
 * Each Intent Section is exposed to Target as its own decision scope named
 * after the section's id (see getSectionScopes / resolveScopeHandler). The
 * offer is a section-scoped composite: `blocks` lists the blocks inside that
 * section to personalize, each with its model-property fields. Because it is
 * scoped to one section, an identical block elsewhere is untouched, and the
 * model-property field names survive copy edits.
 *
 *   scope "hero-intent"  →
 *   { "blocks": [ { "hero": { "title": "…", "subtitle": "…",
 *                             "primaryCta": "…", "secondaryCta": "…" } } ] }
 */

// Normalises `blocks` (array of single-key objects, or a name→fields map) into
// a flat list of [blockName, fields] entries.
function toBlockEntries(blocks) {
  if (Array.isArray(blocks)) {
    return blocks
      .filter((entry) => entry && typeof entry === 'object')
      .flatMap((entry) => Object.entries(entry));
  }
  if (blocks && typeof blocks === 'object') return Object.entries(blocks);
  return [];
}

// Applies a `blocks` composite to the blocks inside one section. Returns true
// only when every listed block applied; an unknown/unpersonalizable block name
// or a not-yet-decorated block yields false, so the scope keeps retrying.
function applyBlocksToSection(section, blocks) {
  const entries = toBlockEntries(blocks);
  if (!section || !entries.length) return false;
  const applied = entries.filter(([name, fields]) => {
    const spec = INTENT_SECTION_BLOCKS[name];
    if (!spec) return false; // block not personalizable in this section
    return applyFields(section.querySelector(spec.selector), fields, spec.fields);
  }).length;
  return applied === entries.length;
}

// Top-level Intent Sections on the page. Only the intent-section model
// (models/_intent-section.json) exposes an `id` field, so a top-level section
// carrying an `id` attribute is definitionally an Intent Section
// (decorateSectionIds in scripts.js promotes the authored id to a real id
// attribute). Read after decoration.
function getIntentSections() {
  const main = document.querySelector('main');
  return main ? [...main.querySelectorAll(':scope > .section[id]')] : [];
}

// Handler for a per-section decision scope: the scope name IS the section id
// (from getSectionScopes), so the offer only carries `blocks` (or a bare blocks
// array) — no id/name needed inside it.
function sectionScopeHandler(scopeName) {
  return (content) => applyBlocksToSection(
    getIntentSections().find((s) => s.id === scopeName) || null,
    Array.isArray(content) ? content : content.blocks,
  );
}

// Each Intent Section id is offered to Target as its own decision scope, so an
// author points a Target activity at scope = the section id and ships a
// blocks-only offer.
function getSectionScopes() {
  return getIntentSections().map((s) => s.id).filter(Boolean);
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

const HEADING = 'h1, h2, h3, h4, h5, h6';

/**
 * One handler per content block. Anchors are the post-decoration class names each
 * block produces (see blocks/<name>/<name>.js), which are stable across reloads.
 * `set` field names are the personalizable slots; author your Target JSON offer
 * to match them.
 */
const FORM_BASED_HANDLERS = {
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
const FORM_BASED_SCOPES = Object.keys(FORM_BASED_HANDLERS);

// --- Flicker control ----------------------------------------------------------
//
// Personalized content is applied client-side after decoration, which can flash
// the default copy first (FOOC — flash of original content). To avoid it we
// pre-hide the TEXT that a scope may replace, then reveal it once the offer has
// applied. Only text nodes are hidden — never whole containers — so background
// images, media and scrims stay fully visible throughout (hiding a container's
// opacity dimmed the background, which looked wrong). Hiding uses opacity, so
// each text box keeps its size and there is no layout shift/CLS. A hard timeout
// reveals everything as a failsafe, so content is never stuck hidden if Target
// is slow or errors.
//
// On reveal, a short fade-in animation replaces the abrupt swap so the
// transition from hidden → personalized copy reads smoothly instead of as a
// flicker. The animation is disabled under prefers-reduced-motion.

const FLICKER_HIDE_CLASS = 'target-flicker-hide';
const FLICKER_REVEAL_CLASS = 'target-flicker-reveal';
const FLICKER_TIMEOUT_MS = 3000;
const FLICKER_FADE_MS = 300;

// Text-bearing elements that Target offers replace (headings, copy, CTA labels,
// list/table cells). Deliberately excludes img/picture/svg so backgrounds and
// media are never dimmed by the flicker hide.
const FLICKER_TEXT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, a, span, td, th, dt, dd';

// Resolves the container(s) a scope will modify. Section-id scopes → their
// section; page → main; default-content → its wrappers; block scopes → every
// instance of that block.
function containersForScope(scope, sectionScopes) {
  if (sectionScopes.includes(scope)) {
    const section = getIntentSections().find((s) => s.id === scope);
    return section ? [section] : [];
  }
  if (scope === 'page') return [document.querySelector('main')].filter(Boolean);
  if (scope === 'default-content') return getBlocks('default-content-wrapper');
  return getBlocks(scope); // block-type scope, e.g. "hero-v3", "metrics"
}

// The text elements a scope may replace — only these are hidden/faded, so the
// background/media of the container stays visible the whole time.
function elementsForScope(scope, sectionScopes) {
  return containersForScope(scope, sectionScopes)
    .flatMap((container) => [...container.querySelectorAll(FLICKER_TEXT_SELECTOR)]);
}

// Injects the pre-hiding + reveal-animation styles once.
function ensureFlickerStyle() {
  if (document.getElementById('target-flicker-style')) return;
  const style = document.createElement('style');
  style.id = 'target-flicker-style';
  // Hide with opacity (not display/visibility) so layout is reserved — no CLS.
  // Reveal fades in so the swap to personalized copy is smooth, not a flicker.
  // forced-colors / reduced-motion users get an instant, animation-free reveal.
  style.textContent = `
    .${FLICKER_HIDE_CLASS}{opacity:0 !important;}
    .${FLICKER_REVEAL_CLASS}{animation:target-flicker-fade ${FLICKER_FADE_MS}ms ease-out;}
    @keyframes target-flicker-fade{from{opacity:0;}to{opacity:1;}}
    @media (prefers-reduced-motion:reduce){.${FLICKER_REVEAL_CLASS}{animation:none;}}
  `;
  document.head.appendChild(style);
}

// Hides the given elements ahead of personalization.
function hideForFlicker(elements) {
  if (!elements.length) return;
  ensureFlickerStyle();
  elements.forEach((el) => el.classList.add(FLICKER_HIDE_CLASS));
}

// Reveals elements with a short fade-in. Removing the hide class restores
// opacity; the reveal class runs the fade, then is cleaned up when the
// animation ends so nothing lingers on the element.
function revealAfterFlicker(elements) {
  elements.forEach((el) => {
    if (!el.classList.contains(FLICKER_HIDE_CLASS)) return; // already revealed
    el.classList.remove(FLICKER_HIDE_CLASS);
    el.classList.add(FLICKER_REVEAL_CLASS);
    el.addEventListener('animationend', () => el.classList.remove(FLICKER_REVEAL_CLASS), {
      once: true,
    });
  });
}

// --- Orchestration -----------------------------------------------------------

/**
 * Resolves the handler for a decision scope. Static scopes (block/section
 * types) come from FORM_BASED_HANDLERS; any other scope that names a section id
 * present on the page is handled dynamically as a per-section scope, so Target
 * can drive a section with a blocks-only offer just by naming the scope after
 * the section id.
 */
function resolveScopeHandler(scope, sectionScopes) {
  if (FORM_BASED_HANDLERS[scope]) return FORM_BASED_HANDLERS[scope];
  if (sectionScopes.includes(scope)) return sectionScopeHandler(scope);
  return null;
}

async function getAndApplyRenderDecisions() {
  // Section ids on the page are each offered to Target as their own decision
  // scope (sections are already decorated by decorateMain at this point), so an
  // activity can target a section by naming the scope after its id.
  const sectionScopes = getSectionScopes();

  // Get the decisions, but don't render them automatically — form-based offers
  // are applied manually to stable anchors below.
  const response = await window.alloy('sendEvent', {
    renderDecisions: false,
    personalization: {
      decisionScopes: [...FORM_BASED_SCOPES, ...sectionScopes],
    },
  });
  const { propositions = [] } = response;

  // Offers keyed by the scope they target (only scopes we can handle).
  const offers = new Map();
  propositions.forEach((p) => {
    if (!resolveScopeHandler(p.scope, sectionScopes) || offers.has(p.scope)) return;
    const jsonItem = (p.items || []).find((i) => i.schema === JSON_CONTENT_ITEM_SCHEMA);
    const content = jsonItem?.data?.content;
    if (content) offers.set(p.scope, content);
  });

  // Pre-hide only the containers a returned offer will replace, so the default
  // copy never flashes before personalization applies (FOOC). Elements resolved
  // now (decoration is complete) and again as the failsafe reveals them.
  const pendingScopes = [...offers.keys()];
  const hidden = new Map(
    pendingScopes.map((scope) => [scope, elementsForScope(scope, sectionScopes)]),
  );
  hidden.forEach((elements) => hideForFlicker(elements));

  // Failsafe: never leave content hidden. Reveal everything after a hard cap
  // regardless of whether Target/handlers finished.
  const revealTimer = window.setTimeout(() => {
    hidden.forEach((elements) => revealAfterFlicker(elements));
    hidden.clear();
  }, FLICKER_TIMEOUT_MS);

  const appliedScopes = new Set();

  onDecoratedElement(() => {
    offers.forEach((content, scope) => {
      if (appliedScopes.has(scope)) return;
      const handler = resolveScopeHandler(scope, sectionScopes);
      if (handler && handler(content)) {
        appliedScopes.add(scope);
        // Reveal this scope's container now that its offer has applied.
        revealAfterFlicker(hidden.get(scope) || []);
        hidden.delete(scope);
      }
    });
    if (!hidden.size) window.clearTimeout(revealTimer);
  });

  // Reporting is deferred to avoid long tasks
  window.setTimeout(() => {
    // Report shown decisions
    window.alloy('sendEvent', {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: {
          decisioning: { propositions },
        },
      },
    });
  });
}

// Initialise immediately on import — the promise is awaited in loadEager so alloy
// is configured before first paint. Decisions are fetched only on target pages.
const alloyLoadedPromise = initWebSDK('./alloy.js', WEBSDK_CONFIG);

if (getMetadata('target')) {
  alloyLoadedPromise.then(() => getAndApplyRenderDecisions());
}

export default alloyLoadedPromise;
export { alloyLoadedPromise, FORM_BASED_HANDLERS, FORM_BASED_SCOPES };
