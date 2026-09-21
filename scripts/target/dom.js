/*
 * DOM + offer-apply engine for the Adobe Target integration.
 *
 * Pure, dependency-free helpers that (a) find stable anchors on the decorated
 * page and (b) apply a JSON offer's fields to them. Everything here is used by
 * the handler factories and the intent-section logic; nothing here knows about
 * scopes, the registry or the request lifecycle.
 */

// --- Decoration observer ------------------------------------------------------

/**
 * Runs `fn` once for anything already decorated, then again each time a section
 * or block finishes decorating (EDS flips data-*-status to "loaded") or a node
 * is added to <body>. This is how offers apply progressively as blocks appear.
 */
export function onDecoratedElement(fn) {
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

// --- Anchor lookup ------------------------------------------------------------

// All instances of a block on the page, e.g. getBlocks('metrics').
export function getBlocks(blockClass) {
  return [...document.querySelectorAll(`.${blockClass}`)];
}

/**
 * Picks a single block instance using a match descriptor:
 *  - match.key      → block whose `data-target-key` attribute equals key
 *                     (author this in UE as a stable, position-independent id)
 *  - match.instance → zero-based index into the list
 *  - default        → the first instance
 */
export function pickBlock(blocks, match = {}) {
  if (match.key) return blocks.find((b) => b.dataset.targetKey === match.key) || null;
  if (typeof match.instance === 'number') return blocks[match.instance] || null;
  return blocks[0] || null;
}

/**
 * Finds a repeated item inside a block (a metric, team card, plan…) by the text
 * of one of its child elements — position-independent. Falls back to the first
 * item when no label is supplied.
 */
export function findItem(block, itemSelector, labelSelector, labelText) {
  if (!block) return null;
  const items = [...block.querySelectorAll(itemSelector)];
  if (!labelText) return items[0] || null;
  return items.find(
    (it) => it.querySelector(labelSelector)?.textContent.trim() === labelText,
  ) || null;
}

// --- Value writers ------------------------------------------------------------

// Sets textContent (preserving surrounding instrumentation) when both exist.
export function setText(el, value) {
  if (el && typeof value === 'string') {
    el.textContent = value;
    return true;
  }
  return false;
}

/**
 * Validates a Target-authored URL before it is written to an href/src. Target
 * offers bypass the block's own isSafeUrl, so re-check here: block
 * javascript:/data:/vbscript: (DOM XSS) and protocol-relative (open-redirect)
 * URLs; allow http(s) and same-origin relative/hash links.
 */
export function isSafeUrl(rawUrl) {
  const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!url) return false;
  if (/^\s*(javascript|data|vbscript):/i.test(url)) return false;
  if (url.startsWith('//')) return false;
  if (/^https?:\/\//i.test(url)) return true;
  return url.startsWith('/') || url.startsWith('#') || url.startsWith('./') || url.startsWith('../');
}

// Sets an element attribute; href/src values must pass isSafeUrl.
export function setAttr(el, attr, value) {
  if (!el || typeof value !== 'string') return false;
  if ((attr === 'href' || attr === 'src' || attr === 'srcset') && !isSafeUrl(value)) return false;
  el.setAttribute(attr, value);
  return true;
}

/**
 * Swaps a hero background image to `url`. The image is a <picture> whose
 * <source srcset> siblings override <img src>, so set the img src AND drop the
 * sources so the new URL wins at every breakpoint. URL is safety-checked.
 *
 * The offer URL is used directly (its own origin) — an absolute Dynamic Media /
 * Scene7 URL works as-is. For a DM URL a `wid`-based srcset is added so the CDN
 * serves a responsive image; otherwise srcset is cleared.
 */
export function setPictureImage(img, url) {
  if (!img || !isSafeUrl(url)) return false;
  const picture = img.closest('picture');
  if (picture) picture.querySelectorAll('source').forEach((s) => s.remove());
  img.setAttribute('src', url);
  if (/\/is\/image\//i.test(url) || /(scene7\.com|\.s7\.|adobedynamicmedia)/i.test(url)) {
    const wid = (w) => { try { const u = new URL(url, window.location.href); u.searchParams.set('wid', w); return u.toString(); } catch (e) { return url; } };
    img.setAttribute('srcset', [750, 1200, 1600, 2000].map((w) => `${wid(String(w))} ${w}w`).join(', '));
    img.setAttribute('sizes', '100vw');
  } else {
    img.removeAttribute('srcset');
  }
  return true;
}

/**
 * Sets the link on an <xe-button> (blocks/xe-hero). The button renders an <a>
 * inside its shadow root from its `href` attribute when it first connects, so
 * updating the attribute alone would not move an already-rendered anchor —
 * update both the host attribute and the shadow <a>. URL is safety-checked.
 */
export function setXeButtonHref(button, url) {
  if (!button || !isSafeUrl(url)) return false;
  button.setAttribute('href', url);
  const anchor = button.shadowRoot && button.shadowRoot.querySelector('a');
  if (anchor) anchor.setAttribute('href', url);
  return true;
}

// --- Apply engine -------------------------------------------------------------

/**
 * Applies one field value to the element resolved by `resolver` within
 * `container`. A resolver is:
 *   - string                       → CSS selector; sets textContent
 *   - (container) => element       → function; sets textContent
 *   - { selector|resolve, attr }   → sets that attribute (href/src URL-checked)
 *   - { selector|resolve, apply }  → custom apply(el, value) => boolean
 */
export function applyField(container, resolver, value) {
  if (typeof resolver === 'string') return setText(container.querySelector(resolver), value);
  if (typeof resolver === 'function') return setText(resolver(container), value);
  if (resolver && typeof resolver === 'object') {
    const el = resolver.resolve
      ? resolver.resolve(container)
      : container.querySelector(resolver.selector);
    if (!el) return false;
    if (resolver.apply) return resolver.apply(el, value);
    if (resolver.attr) return setAttr(el, resolver.attr, value);
  }
  return false;
}

/**
 * Applies each field in `set` to `container` via a fieldMap of
 * { fieldName: resolver } (see applyField for resolver shapes). Unknown fields
 * are ignored. Returns true only when every recognised field applied, so the
 * scope stops retrying on later decoration passes.
 */
export function applyFields(container, set, fieldMap) {
  if (!container || !set) return false;
  let total = 0;
  let applied = 0;
  Object.entries(set).forEach(([field, value]) => {
    const resolver = fieldMap[field];
    if (!resolver) return; // ignore fields this block does not expose
    total += 1;
    if (applyField(container, resolver, value)) applied += 1;
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
export function applyInstructions(content, applyOne) {
  const items = Array.isArray(content.items)
    ? content.items
    : [{ match: content.match || {}, set: content.set || content }];
  if (!items.length) return false;
  const applied = items.filter((it) => applyOne(it.match || {}, it.set || {})).length;
  return applied === items.length;
}
