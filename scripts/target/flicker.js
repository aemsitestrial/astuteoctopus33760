/*
 * Flicker control (FOOC).
 *
 * Personalized content is applied client-side after decoration, which can flash
 * the default copy first (flash of original content). To avoid it we pre-hide
 * the TEXT that a scope may replace, then reveal it once the offer has applied.
 * Only text nodes are hidden — never whole containers — so background images,
 * media and scrims stay fully visible throughout (hiding a container's opacity
 * dimmed the background, which looked wrong). Hiding uses opacity, so each text
 * box keeps its size and there is no layout shift/CLS. A hard timeout reveals
 * everything as a failsafe, so content is never stuck hidden if Target is slow
 * or errors.
 *
 * On reveal, a short fade-in animation replaces the abrupt swap so the
 * transition from hidden → personalized copy reads smoothly instead of as a
 * flicker. The animation is disabled under prefers-reduced-motion.
 */

import { getBlocks } from './dom.js';
import { getIntentSections } from './intent-section.js';

export const FLICKER_TIMEOUT_MS = 3000;

const FLICKER_HIDE_CLASS = 'target-flicker-hide';
const FLICKER_REVEAL_CLASS = 'target-flicker-reveal';
const FLICKER_FADE_MS = 300;

// Text-bearing elements that Target offers replace (headings, copy, CTA labels,
// list/table cells). Deliberately excludes img/picture/svg so backgrounds and
// media are never dimmed by the flicker hide.
const FLICKER_TEXT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, a, span, td, th, dt, dd';

// Resolves the container(s) a scope will modify. Section-id scopes → their
// section; Intent Section block-id scopes → that one block element; page →
// main; default-content → its wrappers; block scopes → every instance of that
// block.
function containersForScope(scope, sectionScopes, blockScopes = []) {
  if (sectionScopes.includes(scope)) {
    const section = getIntentSections().find((s) => s.id === scope);
    return section ? [section] : [];
  }
  if (blockScopes.includes(scope)) {
    return [document.getElementById(scope)].filter(Boolean);
  }
  if (scope === 'page') return [document.querySelector('main')].filter(Boolean);
  if (scope === 'default-content') return getBlocks('default-content-wrapper');
  return getBlocks(scope); // block-type scope, e.g. "hero-v3", "metrics"
}

// The text elements a scope may replace — only these are hidden/faded, so the
// background/media of the container stays visible the whole time.
export function elementsForScope(scope, sectionScopes, blockScopes = []) {
  return containersForScope(scope, sectionScopes, blockScopes)
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
export function hideForFlicker(elements) {
  if (!elements.length) return;
  ensureFlickerStyle();
  elements.forEach((el) => el.classList.add(FLICKER_HIDE_CLASS));
}

// Reveals elements with a short fade-in. Removing the hide class restores
// opacity; the reveal class runs the fade, then is cleaned up when the
// animation ends so nothing lingers on the element.
export function revealAfterFlicker(elements) {
  elements.forEach((el) => {
    if (!el.classList.contains(FLICKER_HIDE_CLASS)) return; // already revealed
    el.classList.remove(FLICKER_HIDE_CLASS);
    el.classList.add(FLICKER_REVEAL_CLASS);
    el.addEventListener('animationend', () => el.classList.remove(FLICKER_REVEAL_CLASS), {
      once: true,
    });
  });
}
