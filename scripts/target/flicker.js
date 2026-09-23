/*
 * Flicker control (FOOC — flash of original content).
 *
 * Personalized content is applied client-side after decoration. If the default
 * copy is allowed to paint before the offer lands, the user sees the original
 * text swap to the personalized text — a flicker. To prevent it we:
 *
 *  1. Pre-hide the TEXT of every targetable region BEFORE the Target request is
 *     even sent (see orchestration.js), so the default copy never paints first.
 *     Only text-bearing elements are hidden — never whole containers — so
 *     background images, media and scrims stay fully visible throughout.
 *  2. Reveal each region the moment its decision is known: immediately for
 *     scopes Target returns no offer for, or once the offer has been applied.
 *     Reveal fades in so the swap to personalized copy is smooth.
 *  3. A hard failsafe timeout reveals everything regardless, so content is never
 *     stuck hidden if Target is slow or errors.
 *
 * Hiding never changes an element's box size (text is made transparent, not
 * display:none), so there is no layout shift / CLS. The fade is disabled under
 * prefers-reduced-motion.
 */

import { getBlocks } from './dom.js';
import { getIntentSections } from './intent-section.js';

// Failsafe cap: never leave content hidden longer than this, even if Target is
// slow or errors. Bumped from 3s to give a slow decision request more room to
// win before we reveal the default copy.
export const FLICKER_TIMEOUT_MS = 4000;

const FLICKER_HIDE_CLASS = 'target-flicker-hide';
const FLICKER_REVEAL_CLASS = 'target-flicker-reveal';
// Reveal fade duration — the transition from hidden → personalized copy reads as
// a smooth settle rather than a snap.
const FLICKER_FADE_MS = 500;

// Text-bearing elements that Target offers replace (headings, copy, CTA labels,
// list/table cells) plus custom-element CTAs (xe-button, whose label lives in
// shadow DOM). Deliberately excludes img/picture/svg so backgrounds and media
// are never dimmed by the flicker hide.
const FLICKER_TEXT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, a, span, td, th, dt, dd, xe-button';

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
// background/media of the container stays visible the whole time. Re-queried
// on each call so late-decorating blocks (whose DOM is replaced by decorate())
// are covered, not just the elements that existed when the scope was first hit.
export function elementsForScope(scope, sectionScopes, blockScopes = []) {
  return containersForScope(scope, sectionScopes, blockScopes)
    .flatMap((container) => [...container.querySelectorAll(FLICKER_TEXT_SELECTOR)]);
}

// Injects the pre-hiding + reveal-animation styles once.
function ensureFlickerStyle() {
  if (document.getElementById('target-flicker-style')) return;
  const style = document.createElement('style');
  style.id = 'target-flicker-style';
  // Hide light-DOM text by making it transparent (not display/visibility) so
  // each box keeps its size — no CLS. Custom-element CTAs (xe-button) render
  // their label in shadow DOM where an outside `color` can't reach, so hide
  // those with `visibility:hidden` instead: it inherits across the shadow
  // boundary and still preserves the box (no CLS). Reveal fades in so the swap
  // to personalized copy is smooth; reduced-motion users get an instant reveal.
  style.textContent = `
    .${FLICKER_HIDE_CLASS}{color:transparent !important;}
    .${FLICKER_HIDE_CLASS} *{color:transparent !important;}
    xe-button.${FLICKER_HIDE_CLASS}{visibility:hidden !important;}
    .${FLICKER_REVEAL_CLASS}{animation:target-flicker-fade ${FLICKER_FADE_MS}ms ease-out;}
    @keyframes target-flicker-fade{from{opacity:0;}to{opacity:1;}}
    @media (prefers-reduced-motion:reduce){.${FLICKER_REVEAL_CLASS}{animation:none;}}
  `;
  document.head.appendChild(style);
}

// Removes the synchronous head.html bridge pre-hide (#target-prehide). That
// snippet masks ALL Intent Section text before first paint to beat the flicker;
// once this module has applied its own granular, per-scope mask (hideScope), the
// coarse bridge is redundant and must go so that scopes with no offer — and any
// text the broad selector caught but no scope owns — are not left hidden until
// the bridge's own 4s failsafe. Safe to call repeatedly.
export function dismissPrehide() {
  const el = document.getElementById('target-prehide');
  if (el) el.remove();
}

// Hides a scope's current text elements ahead of personalization. Safe to call
// repeatedly (e.g. once per decoration pass) — it re-queries so newly decorated
// text inside the scope is hidden too, and adding the class again is a no-op for
// already-hidden elements.
export function hideScope(scope, sectionScopes, blockScopes = []) {
  const elements = elementsForScope(scope, sectionScopes, blockScopes);
  if (!elements.length) return false;
  ensureFlickerStyle();
  elements.forEach((el) => el.classList.add(FLICKER_HIDE_CLASS));
  return true;
}

// Reveals a scope's text with a short fade-in. Re-queries the scope so both the
// originally hidden elements and any that decorated later are revealed. Removing
// the hide class restores the text color; the reveal class runs the fade, then
// is cleaned up on animationend so nothing lingers.
export function revealScope(scope, sectionScopes, blockScopes = []) {
  elementsForScope(scope, sectionScopes, blockScopes).forEach((el) => {
    if (!el.classList.contains(FLICKER_HIDE_CLASS)) return; // already revealed
    el.classList.remove(FLICKER_HIDE_CLASS);
    el.classList.add(FLICKER_REVEAL_CLASS);
    el.addEventListener('animationend', () => el.classList.remove(FLICKER_REVEAL_CLASS), {
      once: true,
    });
  });
}
