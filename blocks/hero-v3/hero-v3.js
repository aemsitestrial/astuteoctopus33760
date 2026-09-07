/*
 * Hero (v3) block
 * A clean, self-contained AEM Edge Delivery Services hero: full-bleed
 * background image, title, optional subtitle, up to two positional CTAs, and
 * six locked layout variants.
 *
 * This is an additive, versioned sibling of blocks/hero-v2/ — a regular
 * inline-authored EDS block with NO Content Fragment / GraphQL dependency.
 * All content is authored directly in the block. Authors pick "Hero V3".
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
const ACTION_STYLES = ['primary', 'static-light'];

// Maps the six locked-preset variant classes (see _hero-v3.json "classes"
// field) to their fixed configuration: named variants make Height/Text
// Alignment/Image Position non-author-editable, so the values are resolved
// from the variant identity rather than from authored fields.
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

  // Base "Hero V3" (All Fields) block: values arrive as data attributes from
  // the rendering pipeline. Fall back to defaults.
  const height = HEIGHT_VALUES.includes(block.dataset.height) ? block.dataset.height : 'responsive';
  const align = ALIGN_VALUES.includes(block.dataset.textAlignment) ? block.dataset.textAlignment : 'center';
  const imagePosition = IMAGE_POSITION_VALUES.includes(block.dataset.imagePosition)
    ? block.dataset.imagePosition
    : 'center';

  return { height, align, imagePosition };
}

/**
 * Builds one <a> action element from normalized action data. actionStyle
 * defaults to the positional rule (first = primary, second = static-light)
 * when the style is missing or invalid.
 */
function buildAction({ text, href, style }, index) {
  if (!isSafeUrl(href)) return null;
  const label = safeText(text);
  if (!label) return null;

  let resolvedStyle = style;
  if (!ACTION_STYLES.includes(resolvedStyle)) {
    resolvedStyle = index === 0 ? 'primary' : 'static-light';
  }

  const action = document.createElement('a');
  action.className = `hero-action hero-action-${resolvedStyle}`;
  action.href = href;
  action.textContent = label;
  return action;
}

/**
 * Normalizes the block's authored markup into the hero data shape consumed
 * by renderHero().
 */
function readInlineData(block) {
  const img = block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const paragraphs = [...block.querySelectorAll('p')];
  const subtitleParagraph = paragraphs.find((p) => !p.querySelector('a') && safeText(p.textContent));

  const actions = [...block.querySelectorAll('a')].slice(0, 2).map((anchor, index) => {
    // Honor the common EDS rich-text convention: <strong> = primary,
    // <em> = static-light, else positional default.
    let style;
    if (anchor.closest('strong')) style = 'primary';
    else if (anchor.closest('em')) style = 'static-light';
    else style = index === 0 ? 'primary' : 'static-light';
    return { text: anchor.textContent, href: anchor.getAttribute('href'), style };
  });

  return {
    imageSrc: img ? img.getAttribute('src') : '',
    imageAlt: img ? safeText(img.getAttribute('alt')) : '',
    // Preserve the authored heading element (keeps its level and any UE
    // instrumentation) rather than reconstructing it.
    headingEl: heading && safeText(heading.textContent) ? heading : null,
    subtitle: subtitleParagraph ? safeText(subtitleParagraph.textContent) : '',
    actions,
  };
}

/**
 * Renders the hero from normalized data into the block.
 */
function renderHero(block, data, layout) {
  const { height, align, imagePosition } = layout;

  // --- Media -------------------------------------------------------------
  const media = document.createElement('div');
  media.className = 'hero-media';

  if (data.imageSrc) {
    const alt = safeText(data.imageAlt);
    // Hero image is very likely the LCP element: eager-load, high priority.
    const optimizedPic = createOptimizedPicture(data.imageSrc, alt, true, [{ width: '1600' }]);
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

  if (data.headingEl) {
    data.headingEl.className = 'hero-title';
    content.append(data.headingEl);
  } else if (safeText(data.titleText)) {
    const heading = document.createElement('h2');
    heading.className = 'hero-title';
    heading.textContent = data.titleText;
    content.append(heading);
  }

  if (safeText(data.subtitle)) {
    const p = document.createElement('p');
    p.className = 'hero-subtitle';
    p.textContent = data.subtitle;
    content.append(p);
  }

  const actionEls = (data.actions || [])
    .map((action, index) => buildAction(action, index))
    .filter(Boolean);
  if (actionEls.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-actions';
    actionEls.forEach((el) => actions.append(el));
    content.append(actions);
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

  // Stable selector for Adobe Target.
  block.dataset.blockName = 'hero-v3';
}

export default function decorate(block) {
  const data = readInlineData(block);
  renderHero(block, data, resolveLayoutConfig(block));
}
