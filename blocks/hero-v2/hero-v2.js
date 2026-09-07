/*
 * Hero (v2) block
 * Spec-based AEM Edge Delivery Services hero: full-bleed background image,
 * title, optional subtitle, up to two positional CTAs, and six locked layout
 * variants (see docs/hero-block/README.md).
 *
 * This is an additive, versioned sibling of blocks/hero/ — the original hero
 * block is intentionally left untouched. Authors pick "Hero V2" to opt in.
 *
 * Two content sources are supported, both funneling into the same renderer:
 *   1. Inline authoring — image/title/subtitle/actions authored in the block.
 *   2. Content Fragment — the block contains only a CF path; the hero data is
 *      fetched from a persisted GraphQL query and rendered client-side.
 *
 * Scope: vanilla JS only, no globals, no unsafe HTML injection, defensive
 * against missing/invalid authored or fetched content.
 */

// createOptimizedPicture is the standard EDS boilerplate helper (scripts/aem.js)
// used across Franklin/EDS projects to generate responsive <picture> markup.
import { createOptimizedPicture } from '../../scripts/aem.js';
// getSiteConfig reads environment-specific values from /config.json so nothing
// environment-specific is hardcoded (used here for the hero's query name).
import { getSiteConfig } from '../../scripts/scripts.js';
// Shared Content Fragment GraphQL service — endpoint resolution, persisted
// query fetching, and asset-URL resolution, reusable across CF-backed blocks.
import { fetchFragmentByPath, getCfImageUrl } from '../../scripts/cf-graphql.js';

// Persisted query name is read from config with this documented fallback.
const DEFAULT_HERO_QUERY = 'hero-by-path';

const HEIGHT_VALUES = ['responsive', 'tall', 'standard', 'compact'];
const ALIGN_VALUES = ['center', 'left'];
const IMAGE_POSITION_VALUES = ['center', 'top', 'bottom'];
const ACTION_STYLES = ['primary', 'static-light'];

// Maps the six locked-preset variant classes (see _hero-v2.json "classes"
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
 * Builds one <a> action element from normalized action data. actionStyle
 * defaults to the spec-defined positional rule (first = primary, second =
 * static-light) when the style is missing or invalid.
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
 * Normalizes the block's authored (inline) markup into the shared hero data
 * shape consumed by renderHero().
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
 * Normalizes a Content Fragment item (as returned by the shared CF GraphQL
 * service) into the hero data shape consumed by renderHero(). Field names
 * match docs/hero-block/hero.model.json. Hero-specific mapping stays here;
 * generic fetch/URL concerns live in scripts/cf-graphql.js.
 */
function normalizeFragment(item) {
  if (!item || typeof item !== 'object') return null;

  const rawActions = Array.isArray(item.actions) ? item.actions : [];
  const actions = rawActions.slice(0, 2).map((a) => ({
    text: a?.actionText,
    href: a?.actionLink,
    style: a?.actionStyle,
  }));

  return {
    imageSrc: getCfImageUrl(item.image),
    imageAlt: safeText(item.imageAlt),
    // richtext/plain title from the CF: build a heading element (h2 by
    // default; a hero is rarely the page's only h1 when CF-driven).
    titleText: safeText(item.title),
    subtitle: safeText(item.subtitle),
    actions,
    // Layout hints from the CF, used only for the base (non-locked) block.
    height: item.height,
    textAlignment: item.textAlignment,
    imagePosition: item.imagePosition,
  };
}

/**
 * Fetches a single hero Content Fragment by path via the shared CF GraphQL
 * service, then maps it to the hero data shape. The persisted query name comes
 * from /config.json (cf.graphql.query.heroByPath), defaulting to 'hero-by-path'.
 * @returns {Promise<Object|null>} normalized hero data, or null on any failure
 */
async function fetchHeroFragment(path) {
  const config = await getSiteConfig();
  const queryName = safeText(config['cf.graphql.query.heroByPath']) || DEFAULT_HERO_QUERY;
  const item = await fetchFragmentByPath(queryName, path);
  return normalizeFragment(item);
}

/**
 * Resolves the Content Fragment path for CF-driven mode, or '' for inline mode.
 *
 * The authoring model (blocks/hero-v2/_hero-v2.json) exposes a "Content
 * Fragment" field (component: aem-content) which delivers as a link to the
 * chosen fragment. Content Fragments are always DAM assets, so a link whose
 * href points under /content/dam/ is the CF reference — this reliably
 * distinguishes it from CTA links (which target pages or external URLs) even
 * when inline fields are also (mistakenly) filled.
 *
 * Falls back to the document-authoring convention: if there is no inline
 * image/heading and the block's only content is an absolute path, use it.
 */
function getFragmentPath(block) {
  const cfLink = block.querySelector('a[href^="/content/dam/"]');
  if (cfLink) return cfLink.getAttribute('href');

  if (block.querySelector('img, h1, h2, h3, h4, h5, h6')) return '';
  const link = block.querySelector('a[href]');
  const candidate = link ? link.getAttribute('href') : safeText(block.textContent);
  // Treat only absolute in-repo paths as CF references (e.g. /content/dam/...).
  return candidate.startsWith('/') ? candidate : '';
}

/**
 * Renders the hero from normalized data into the block. This is the single
 * DOM-building path shared by inline and CF-driven modes.
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

  // Stable selector for Adobe Target (see Target integration guide).
  block.dataset.blockName = 'hero-v2';
}

export default async function decorate(block) {
  const fragmentPath = getFragmentPath(block);

  let data;
  if (fragmentPath) {
    // CF-driven mode: fetch from the persisted query, fall back to an empty
    // (but non-collapsing) hero if the fetch fails.
    data = (await fetchHeroFragment(fragmentPath)) || { actions: [] };

    // Let the fetched CF drive layout on the base (non-locked) block by
    // mirroring its values onto the dataset before resolving the config.
    if (!Object.keys(VARIANT_PRESETS).some((key) => block.classList.contains(key))) {
      if (HEIGHT_VALUES.includes(data.height)) {
        block.dataset.height = data.height;
      }
      if (ALIGN_VALUES.includes(data.textAlignment)) {
        block.dataset.textAlignment = data.textAlignment;
      }
      if (IMAGE_POSITION_VALUES.includes(data.imagePosition)) {
        block.dataset.imagePosition = data.imagePosition;
      }
    }
  } else {
    // Inline authoring mode.
    data = readInlineData(block);
  }

  renderHero(block, data, resolveLayoutConfig(block));
}
