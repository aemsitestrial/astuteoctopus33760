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

// Widths used for the responsive background image srcset.
const IMAGE_WIDTHS = [750, 1200, 1600, 2000];

/**
 * Returns a trimmed string, or '' for any non-string / nullish input.
 * Centralizes defensive text handling for missing/invalid authored content.
 */
function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * True for an absolute/external image URL (has an origin), e.g. a Dynamic Media
 * / Scene7 delivery URL. These must NOT go through createOptimizedPicture: that
 * helper keeps only the pathname (dropping the DM host) and appends EDS-pipeline
 * params Scene7 does not understand, so the image would 404.
 */
function isExternalImage(src) {
  return /^https?:\/\//i.test(safeText(src)) || safeText(src).startsWith('//');
}

/**
 * Heuristic: is this a Dynamic Media / Scene7 image delivery URL? Matches the
 * classic `/is/image/` delivery path and common Scene7 hostnames.
 */
function isDynamicMedia(src) {
  const url = safeText(src);
  return /\/is\/image\//i.test(url) || /(scene7\.com|\.s7\.|adobedynamicmedia)/i.test(url);
}

/**
 * Adds/overrides a query param on a URL string, preserving the origin. Used to
 * build a Dynamic Media srcset (Scene7 uses `wid` for width).
 */
function withParam(src, key, value) {
  try {
    const url = new URL(src, window.location.href);
    url.searchParams.set(key, value);
    return url.toString();
  } catch (e) {
    return src;
  }
}

/**
 * Builds a responsive <picture> for an external/DM image, rendered directly at
 * its own origin (no EDS media pipeline). For Dynamic Media URLs a `wid`-based
 * srcset is generated so the CDN serves an appropriately sized image; for other
 * absolute URLs the src is used as-is. The hero image is the likely LCP element,
 * so it is eager + high priority.
 */
function buildExternalPicture(src, alt) {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.setAttribute('alt', alt);
  img.setAttribute('loading', 'eager');
  img.setAttribute('fetchpriority', 'high');
  if (isDynamicMedia(src)) {
    img.setAttribute('src', withParam(src, 'wid', String(IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1])));
    img.setAttribute(
      'srcset',
      IMAGE_WIDTHS.map((w) => `${withParam(src, 'wid', String(w))} ${w}w`).join(', '),
    );
    img.setAttribute('sizes', '100vw');
  } else {
    img.setAttribute('src', src);
  }
  picture.append(img);
  return picture;
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
 *
 * The model (_hero-v3.json) delivers one field per row, in order: image,
 * title, subtitle, actions. Rows are therefore classified positionally rather
 * than by heuristics: the image row is the one with a picture/img, action rows
 * are those with links, and the remaining text rows are — in document order —
 * the title then the subtitle. This correctly handles a title authored as
 * plain rich text (not a heading), while still preserving a heading element
 * when the author uses one.
 */
function readInlineData(block) {
  const rows = [...block.children];
  let img = null;
  const anchorEls = [];
  const textCells = [];

  rows.forEach((row) => {
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    if (!img && cell.querySelector('img')) {
      img = cell.querySelector('img');
      return;
    }
    const cellAnchors = [...cell.querySelectorAll('a')];
    if (cellAnchors.length) {
      anchorEls.push(...cellAnchors);
      return;
    }
    if (safeText(cell.textContent)) textCells.push(cell);
  });

  const actions = anchorEls.slice(0, 2).map((anchor, index) => {
    // Honor the common EDS rich-text convention: <strong> = primary,
    // <em> = static-light, else positional default.
    let style;
    if (anchor.closest('strong')) style = 'primary';
    else if (anchor.closest('em')) style = 'static-light';
    else style = index === 0 ? 'primary' : 'static-light';
    return { text: anchor.textContent, href: anchor.getAttribute('href'), style };
  });

  // Title = first text row, subtitle = second (model field order).
  const titleCell = textCells[0] || null;
  const subtitleCell = textCells[1] || null;
  const headingEl = titleCell ? titleCell.querySelector('h1, h2, h3, h4, h5, h6') : null;

  return {
    imageSrc: img ? img.getAttribute('src') : '',
    imageAlt: img ? safeText(img.getAttribute('alt')) : '',
    // Preserve an authored heading element (keeps its level and any UE
    // instrumentation); otherwise the plain title text is used to build one.
    headingEl: headingEl && safeText(headingEl.textContent) ? headingEl : null,
    titleText: !headingEl && titleCell ? safeText(titleCell.textContent) : '',
    subtitle: subtitleCell ? safeText(subtitleCell.textContent) : '',
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
    if (isExternalImage(data.imageSrc)) {
      // Absolute URL (e.g. Dynamic Media / Scene7): render at its own origin,
      // bypassing the EDS optimizer which would drop the host and 404.
      media.append(buildExternalPicture(data.imageSrc, alt));
    } else {
      // Same-origin asset: use the EDS media pipeline for responsive delivery.
      const optimizedPic = createOptimizedPicture(data.imageSrc, alt, true, [{ width: '1600' }]);
      optimizedPic.querySelectorAll('img').forEach((el) => {
        el.setAttribute('alt', alt); // decorative fallback: alt="" is valid and intentional
        el.setAttribute('loading', 'eager');
        el.setAttribute('fetchpriority', 'high');
      });
      media.append(optimizedPic);
    }
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
