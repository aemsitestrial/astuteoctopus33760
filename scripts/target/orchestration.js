/*
 * Orchestration — scope resolution and the decision fetch/apply lifecycle.
 *
 * Ties the pieces together: requests every scope we can handle, keeps the JSON
 * offers we understand, pre-hides the text each returned offer will replace,
 * then applies offers progressively as blocks decorate and reveals each once it
 * lands. Reporting is deferred off the critical path. See the module header in
 * scripts/target.js for the EDS load-phasing contract.
 */

import { JSON_CONTENT_ITEM_SCHEMA } from './websdk.js';
import { onDecoratedElement } from './dom.js';
import { FORM_BASED_HANDLERS, FORM_BASED_SCOPES } from './handlers.js';
import {
  getSectionScopes,
  getIntentSectionBlockScopes,
  sectionScopeHandler,
  intentSectionBlockScopeHandler,
} from './intent-section.js';
import {
  FLICKER_TIMEOUT_MS,
  elementsForScope,
  hideForFlicker,
  revealAfterFlicker,
} from './flicker.js';

/**
 * Resolves the handler for a decision scope. Static scopes (block/section
 * types) come from FORM_BASED_HANDLERS; any other scope that names a section id
 * present on the page is handled dynamically as a per-section scope, so Target
 * can drive a section with a blocks-only offer just by naming the scope after
 * the section id. Finally, a scope that names the auto-generated id of a
 * personalizable block inside an Intent Section is handled as a per-block scope,
 * so Target can drive a single block with a flat field offer.
 */
function resolveScopeHandler(scope, sectionScopes, blockScopes = []) {
  if (FORM_BASED_HANDLERS[scope]) return FORM_BASED_HANDLERS[scope];
  if (sectionScopes.includes(scope)) return sectionScopeHandler(scope);
  if (blockScopes.includes(scope)) return intentSectionBlockScopeHandler(scope);
  return null;
}

export default async function getAndApplyRenderDecisions() {
  // Section ids on the page are each offered to Target as their own decision
  // scope (sections are already decorated by decorateMain at this point), so an
  // activity can target a section by naming the scope after its id.
  const sectionScopes = getSectionScopes();
  // Each personalizable block inside an Intent Section (stamped with a stable
  // `<section-id>-<block>` id) is ALSO offered as its own decision scope, so an
  // activity can target a single block directly with a flat field offer.
  const blockScopes = getIntentSectionBlockScopes();

  // Get the decisions, but don't render them automatically — form-based offers
  // are applied manually to stable anchors below.
  const response = await window.alloy('sendEvent', {
    renderDecisions: false,
    personalization: {
      decisionScopes: [...FORM_BASED_SCOPES, ...sectionScopes, ...blockScopes],
    },
  });
  const { propositions = [] } = response;

  // Offers keyed by the scope they target (only scopes we can handle).
  const offers = new Map();
  propositions.forEach((p) => {
    if (!resolveScopeHandler(p.scope, sectionScopes, blockScopes) || offers.has(p.scope)) return;
    const jsonItem = (p.items || []).find((i) => i.schema === JSON_CONTENT_ITEM_SCHEMA);
    const content = jsonItem?.data?.content;
    if (content) offers.set(p.scope, content);
  });

  // Pre-hide only the containers a returned offer will replace, so the default
  // copy never flashes before personalization applies (FOOC). Elements resolved
  // now (decoration is complete) and again as the failsafe reveals them.
  const pendingScopes = [...offers.keys()];
  const hidden = new Map(
    pendingScopes.map((scope) => [scope, elementsForScope(scope, sectionScopes, blockScopes)]),
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
      const handler = resolveScopeHandler(scope, sectionScopes, blockScopes);
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
