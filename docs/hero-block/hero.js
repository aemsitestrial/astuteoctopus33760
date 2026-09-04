/*
 * Hero block
 * AEM Edge Delivery Services block, backed by a Content Fragment (model: "hero")
 * authored/edited through Universal Editor.
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

// Maps the six locked-preset variant classes (see component-definition.json
// "presets") to their fixed configuration. Required per Assumptions and Gaps
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

  // Base "Hero" (All Fields) block: values arrive as data attributes from
  // the CF-driven rendering pipeline (see Universal Editor / CF integration
  // note in the architecture section). Fall back to spec defaults.
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
  action.className = `hero__action hero__action--${style}`;
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
  const rows = [...block.children];
  const [mediaRow, contentRow] = rows;

  const { height, align, imagePosition } = resolveLayoutConfig(block);

  // --- Media -------------------------------------------------------------
  const media = document.createElement('div');
  media.className = 'hero__media';

  const img = mediaRow ? mediaRow.querySelector('img') : null;
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

  // --- Content -------------------------------------------------------------
  const content = document.createElement('div');
  content.className = 'hero__content';

  const heading = contentRow ? contentRow.querySelector('h1, h2, h3, h4, h5, h6') : null;
  if (heading && safeText(heading.textContent)) {
    heading.className = 'hero__title';
    content.append(heading);
  }

  const paragraphs = contentRow ? [...contentRow.querySelectorAll('p')] : [];
  const subtitleParagraph = paragraphs.find((p) => !p.querySelector('a'));
  if (subtitleParagraph && safeText(subtitleParagraph.textContent)) {
    subtitleParagraph.className = 'hero__subtitle';
    content.append(subtitleParagraph);
  }

  const anchors = contentRow ? [...contentRow.querySelectorAll('a')].slice(0, 2) : [];
  if (anchors.length) {
    const actions = document.createElement('div');
    actions.className = 'hero__actions';
    anchors.forEach((anchor, index) => {
      const action = buildAction(anchor, index);
      if (action) actions.append(action);
    });
    if (actions.childElementCount) content.append(actions);
  }

  // --- Assemble ------------------------------------------------------------
  block.textContent = '';
  block.append(media, content);

  block.classList.add(`hero--height-${height}`, `hero--align-${align}`);
  if (imagePosition) {
    // object-position is applied via CSS (.hero--image-position-*), not an
    // inline style, so it stays overridable by CSS/Target and has no
    // specificity conflicts.
    block.classList.add(`hero--image-position-${imagePosition}`);
  }

  block.dataset.height = height;
  block.dataset.textAlignment = align;
  if (imagePosition) block.dataset.imagePosition = imagePosition;

  // Stable selectors for Adobe Target (see Target integration guide).
  block.dataset.blockName = 'hero';
}
