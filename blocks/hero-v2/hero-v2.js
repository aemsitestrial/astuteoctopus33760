/*
 * Hero (v2) block
 * Spec-based AEM Edge Delivery Services hero: full-bleed background image,
 * title, optional subtitle, up to two positional CTAs, and six locked layout
 * variants (see docs/hero-block/README.md).
 *
 * This is an additive, versioned sibling of blocks/hero/ — the original hero
 * block is intentionally left untouched. Authors pick "Hero V2" to opt in.
 *
 * Scope: vanilla JS only, no globals, no unsafe HTML injection, defensive
 * against missing/invalid authored content.
 */

// createOptimizedPicture is the standard EDS boilerplate helper (scripts/aem.js)
// used across Franklin/EDS projects to generate responsive <picture> markup.
import { createOptimizedPicture } from '../../scripts/aem.js';

const HEIGHT_VALUES = ['responsive', 'tall', 'standard', 'compact'];
const ALIGN_VALUES = ['center', 'left'];
const IMAGE_POSITION_VALUES = ['center', 'top', 'bottom'];

// Maps the six locked-preset variant classes (see _hero-v2.json "classes")
// field) to their fixed configuration. Required per Assumptions and Gaps
// item A1: named variants make Height/Text Alignment/Image Position
// non-author-editable, so the values must be resolved from the variant
// identity rather than from authored fields.
const VARIANT_PRESETS = {
  'tall-center-with-action': { height: 'tall', align: 'center', imagePosition: 'center' },
  'tall-left-with-actions': { height: 'tall', align: 'left', imagePosition: 'center' },
  'standard-center-with-actions': { height: 'standard', align: 'center', imagePosition: null },
  'standard-left-with-actions': { height: 'standard', align: 'left', imagePosition: null },
  'compact-center-with-actions': { height: 'compact', align: 'center', imagePosition: null },
  'compact-left-with-actions': { height: 'compact', align: 'left', imagePosition: null },
};

/**
 * Returns a trimmed string, or '' for any non-string / nullish input.
 * Centralizes defensive text handling for missing/invalid authored content.
 */
function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Validates a link target before it is written to the DOM.
 * Blocks javascript:/data:/vbscript: pseudo-protocols (DOM XSS vector) and
 * protocol-relative URLs (open-redirect ambiguity). Allows absolute https(s)
 * links and same-origin relative/hash links only.
 */
function isSafeUrl(rawUrl) {
  const url = safeText(rawUrl);
  if (!url) return false;
  if (/^\s*(javascript|data|vbscript):/i.test(url)) return false;
  if (url.startsWith('//')) return false;
  if (/^https:\/\//i.test(url)) return true;
  if (/^http:\/\//i.test(url)) return true; // allowed but flagged in security checklist
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) return true;
  return false;
}

/**
 * Resolves the effective height/alignment/imagePosition for this block
 * instance: locked variant preset wins over authored/default values.
 */
function resolveLayoutConfig(block) {
  const presetKey = Object.keys(VARIANT_PRESETS).find((key) => block.classList.contains(key));
  if (presetKey) {
    return VARIANT_PRESETS[presetKey];
  }

  // Base "Hero V2" (All Fields) block: values arrive as data attributes from
  // the rendering pipeline. Fall back to spec defaults.
  const height = HEIGHT_VALUES.includes(block.dataset.height) ? block.dataset.height : 'responsive';
  const align = ALIGN_VALUES.includes(block.dataset.textAlignment) ? block.dataset.textAlignment : 'center';
  const imagePosition = IMAGE_POSITION_VALUES.includes(block.dataset.imagePosition)
    ? block.dataset.imagePosition
    : 'center';

  return { height, align, imagePosition };
}

/**
 * Builds one <a> action element. actionStyle defaults to the spec-defined
 * positional rule (first = primary, second = static-light) when the
 * authored style is missing or invalid, and also recognizes the common EDS
 * authoring convention of <strong> = primary / <em> = static-light so
 * authors typing directly into a rich-text cell get the same result.
 */
function buildAction(anchor, index) {
  const href = anchor.getAttribute('href');
  if (!isSafeUrl(href)) return null;

  const text = safeText(anchor.textContent);
  if (!text) return null;

  let style = index === 0 ? 'primary' : 'static-light';
  if (anchor.closest('strong')) style = 'primary';
  else if (anchor.closest('em')) style = 'static-light';

  const action = document.createElement('a');
  action.className = `hero-action hero-action-${style}`;
  action.href = href;
  action.textContent = text;

  // Preserve intent for a link that opens a new tab, added defensively by
  // authors; never trust rel to already be safe.
  if (anchor.target === '_blank') {
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
  }

  return action;
}

export default function decorate(block) {
  const { height, align, imagePosition } = resolveLayoutConfig(block);

  // --- Media -------------------------------------------------------------
  const media = document.createElement('div');
  media.className = 'hero-media';

  // First authored image anywhere in the block is the background. Scanning the
  // whole block (rather than a fixed first row) keeps this robust to both
  // document-authored 2-row tables and xwalk one-field-per-row rendering.
  const img = block.querySelector('img');
  if (img) {
    const alt = safeText(img.getAttribute('alt'));
    // Hero image is very likely the LCP element: eager-load, high priority.
    const optimizedPic = createOptimizedPicture(img.src, alt, true, [{ width: '1600' }]);
    optimizedPic.querySelectorAll('img').forEach((el) => {
      el.setAttribute('alt', alt); // decorative fallback: alt="" is valid and intentional
      el.setAttribute('loading', 'eager');
      el.setAttribute('fetchpriority', 'high');
    });
    media.append(optimizedPic);
  }
  // Missing image: media stays empty; CSS provides a neutral background so
  // layout does not collapse or shift when the image is absent.

  // --- Content -----------------------------------------------------------
  const content = document.createElement('div');
  content.className = 'hero-content';

  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && safeText(heading.textContent)) {
    heading.className = 'hero-title';
    content.append(heading);
  }

  // Subtitle = first non-empty paragraph that is not just a CTA link wrapper.
  const paragraphs = [...block.querySelectorAll('p')];
  const subtitleParagraph = paragraphs.find(
    (p) => !p.querySelector('a') && safeText(p.textContent),
  );
  if (subtitleParagraph) {
    subtitleParagraph.className = 'hero-subtitle';
    content.append(subtitleParagraph);
  }

  const anchors = [...block.querySelectorAll('a')].slice(0, 2);
  if (anchors.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-actions';
    anchors.forEach((anchor, index) => {
      const action = buildAction(anchor, index);
      if (action) actions.append(action);
    });
    if (actions.childElementCount) content.append(actions);
  }

  // --- Assemble ----------------------------------------------------------
  block.textContent = '';
  block.append(media, content);

  block.classList.add(`hero-height-${height}`, `hero-align-${align}`);
  if (imagePosition) {
    // object-position is applied via CSS (.hero-image-position-*), not an
    // inline style, so it stays overridable by CSS/Target and has no
    // specificity conflicts.
    block.classList.add(`hero-image-position-${imagePosition}`);
  }

  block.dataset.height = height;
  block.dataset.textAlignment = align;
  if (imagePosition) block.dataset.imagePosition = imagePosition;

  // Stable selector for Adobe Target (see Target integration guide).
  block.dataset.blockName = 'hero-v2';
}
