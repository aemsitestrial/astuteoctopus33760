/*
 * Adobe Target integration for AEM Edge Delivery Services — entry point.
 *
 * Form-Based / JSON offers only: Target returns a JSON blob per decision scope
 * and this module applies it to stable, post-decoration anchors (see
 * FORM_BASED_HANDLERS). There is no VEC / dom-action support — VEC selectors are
 * captured against a single DOM snapshot and do not survive EDS decoration, so
 * form-based offers are the supported path on EDS.
 *
 * The implementation is split into cohesive modules under scripts/target/:
 *   - websdk.js         alloy bootstrap + datastream config
 *   - dom.js            DOM lookup + the offer-apply engine + decoration observer
 *   - fields.js         per-block field maps + INTENT_SECTION_BLOCKS
 *   - handlers.js       handler factories + the FORM_BASED_HANDLERS registry
 *   - intent-section.js per-section and per-block Intent Section scopes
 *   - flicker.js        FOOC pre-hide / reveal control
 *   - orchestration.js  scope resolution + the decision fetch/apply lifecycle
 * This entry only bootstraps alloy and, on target pages, kicks off the fetch.
 *
 * Intent Sections get their own decision scope named after the section id, so
 * one section can be personalized with a blocks-only offer; each personalizable
 * block inside one is also exposed as a scope named after its generated id.
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

import { getMetadata } from './aem.js';
import { WEBSDK_CONFIG, initWebSDK } from './target/websdk.js';
import { FORM_BASED_HANDLERS, FORM_BASED_SCOPES } from './target/handlers.js';
import getAndApplyRenderDecisions from './target/orchestration.js';

// Initialise immediately on import — the promise is awaited in loadEager so alloy
// is configured before first paint. The path is resolved relative to websdk.js
// (where initWebSDK's dynamic import() actually runs), so `../alloy.js` points
// back at scripts/alloy.js. Decisions are fetched only on target pages.
const alloyLoadedPromise = initWebSDK('../alloy.js', WEBSDK_CONFIG);

if (getMetadata('target')) {
  alloyLoadedPromise.then(() => getAndApplyRenderDecisions());
}

export default alloyLoadedPromise;
export { alloyLoadedPromise, FORM_BASED_HANDLERS, FORM_BASED_SCOPES };
