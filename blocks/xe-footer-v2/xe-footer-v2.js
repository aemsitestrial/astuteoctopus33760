import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';
import { hyperlink } from '../../scripts/components/xe-footer-utils.js';
import decorateSocialLinks, {
  decorateDefaults as defaultSocialLinks,
  isSocialLinks,
} from '../xe-footer-social-links/xe-footer-social-links.js';
import decorateLegalLinks, {
  decorateDefaults as defaultLegalLinks,
} from '../xe-footer-legal-links/xe-footer-legal-links.js';

/*
 * XE Footer V2
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer), following its reference markup:
 *
 *   <xe-footer columns="5">
 *     <picture slot="logo">…</picture>          (or <xe-logo> when no logo is authored)
 *     <span slot="copyright">© 2026 Xcel Energy Inc. All rights reserved.</span>
 *     <xe-footer-column heading="Company">
 *       <xe-hyperlink href="…" variant="variant">Careers</xe-hyperlink>…
 *     </xe-footer-column>…
 *     <xe-icon-button slot="social" …>…</xe-icon-button>…       (xe-footer-social-links)
 *     <xe-hyperlink slot="legal" … trailing-icon>…</xe-hyperlink>… (xe-footer-legal-links)
 *     <img slot="banner-image" src="…" alt="">
 *     <span slot="tagline">Our Energy, Your Power</span>
 *   </xe-footer>
 *
 * The block is a container (filter `xe-footer-v2`): its own fields (logo +
 * alt, copyright, banner background + tagline) render as rows first, then one
 * row per child item — one social profile or legal link each. Those items are
 * decorated by their own blocks (xe-footer-social-links /
 * xe-footer-legal-links); the live Xcel Energy footer's links render when
 * none are authored.
 *
 * Rows are recognized by what they hold rather than by position, so blank
 * fields can't shift the others and older footers still render: key-value
 * rows (`name | value`, footers created while the block was key-value) by
 * name, a row instrumented with an item model (Universal Editor) as that item,
 * a row of only links as an item, headings + link lists as link columns, and
 * images / text as the logo, banner and copyright.
 *
 * <xe-footer-column> wraps each link in an <li> inside its list; below 1024px
 * it switches to an accordion. Styling comes from the Ignite tokens (loaded by
 * scripts/components/ignite.js); xe-footer-v2.css only covers authored
 * light-DOM content that page-level rules would otherwise restyle.
 */

// Link-column slots of key-value footers (column1Heading/column1Links … column5…).
const COLUMN_SLOTS = 5;

// <xe-footer-column>'s accordion breakpoint (it hard-codes this media query).
const ACCORDION_QUERY = window.matchMedia('(max-width: 1024px)');

// Child item models (the xe-footer-v2 filter) → the footer area they fill.
// Each item is one link (social profile or legal link).
const ITEM_MODELS = {
  'xe-footer-social-links': 'social',
  'xe-footer-legal-links': 'legal',
};

/** The element holding a row's authored content (its single cell). */
function cellOf(row) {
  return row.children.length === 1 ? row.firstElementChild : row;
}

/** Normalizes a field name the way EDS's toClassName() does (readBlockConfig keys). */
function toKey(name) {
  return name.trim().toLowerCase()
    .replace(/[^0-9a-z]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** True when a value holds something worth rendering. */
function hasContent(element) {
  return element.textContent.trim() || element.querySelector('img, picture, svg');
}

/** True when all of `part`'s text is link text (whitespace aside). */
function isLinksOnly(part) {
  const squash = (text) => text.replace(/\s+/g, '');
  const linkText = [...part.querySelectorAll('a')].map((a) => a.textContent).join('');
  return squash(part.textContent) === squash(linkText);
}

/**
 * True when `cell` is nothing but links: a list, or paragraphs, of links whose
 * text is all the text there is (so a copyright line with a link isn't one).
 */
function isLinkList(cell) {
  const nodes = [...cell.children];
  if (!nodes.length || !nodes.every((node) => node.querySelector('a'))) return false;
  return nodes.every((node) => {
    const items = node.matches('ul, ol') ? [...node.children] : [node];
    return items.every(isLinksOnly);
  });
}

/** True when `cell` is headings followed by link lists (link columns). */
function isLinkColumns(cell) {
  const nodes = [...cell.children];
  return nodes.some((node) => !node.querySelector('a') && node.textContent.trim())
    && nodes.some((node) => node.querySelector('a'));
}

/**
 * Reads the authored rows into `{ normalizedName: valueElement }` plus
 * `items: { social: [row…], legal: [row…] }` (item rows are kept whole, since
 * the row carries the item's Universal Editor instrumentation).
 */
function readFields(block) {
  const fields = { items: { social: [], legal: [] } };
  const addItem = (kind, row) => fields.items[kind].push(row);
  let seenCopyright = false;

  [...block.children].forEach((row) => {
    const model = ITEM_MODELS[row.getAttribute('data-aue-model')];
    if (model) {
      addItem(model, row);
      return;
    }

    // Key-value row: read by name.
    if (row.children.length === 2) {
      const key = toKey(row.firstElementChild.textContent);
      const value = row.children[1];
      if (key && hasContent(value)) fields[key] = value;
      return;
    }

    // Plain row: recognize by content. Social icon links hold images too, so
    // link lists are checked before the logo / banner.
    const cell = cellOf(row);
    if (!hasContent(cell)) return;
    const image = cell.querySelector('picture, img');
    const linkList = isLinkList(cell);
    if (linkList && (!image || isSocialLinks(cell))) {
      addItem(isSocialLinks(cell) ? 'social' : 'legal', row);
    } else if (image) {
      // The logo comes before the copyright; the banner (image + tagline) after.
      const isBanner = fields.logo || seenCopyright || cell.textContent.trim();
      if (isBanner) {
        fields['banner-background'] = cell;
        const tagline = [...cell.childNodes].find((node) => node.textContent.trim());
        if (tagline) fields['banner-tagline'] = tagline;
      } else {
        fields.logo = cell;
      }
    } else if (isLinkColumns(cell)) {
      fields.footerlinks = cell;
    } else if (fields['banner-background']) {
      // Past the banner only child items follow (model order); one without a
      // link yet (e.g. a network chosen but no URL) renders nothing.
    } else if (!fields.copyright) {
      fields.copyright = cell;
      seenCopyright = true;
    }
  });
  return fields;
}

/** An <xe-footer-column> holding the links found in `container`. */
function buildColumn(heading, container) {
  const column = document.createElement('xe-footer-column');
  if (heading) column.setAttribute('heading', heading);
  column.append(...[...container.querySelectorAll('a')].map((anchor) => hyperlink(anchor)));
  return column;
}

/** Columns from a key-value footer's column slots, skipping slots without links. */
function buildSlotColumns(fields) {
  const columns = [];
  for (let slot = 1; slot <= COLUMN_SLOTS; slot += 1) {
    const links = fields[`column${slot}links`];
    if (links && links.querySelector('a')) {
      const heading = fields[`column${slot}heading`];
      const column = buildColumn(heading ? heading.textContent.trim() : '', links);
      moveInstrumentation(links, column);
      columns.push(column);
    }
  }
  return columns;
}

/**
 * Columns from footer-links rich text: a flat sequence of heading (<p>/<hN>)
 * + link list pairs, one column per heading. Links before any heading get an
 * untitled column so they are kept.
 */
function buildColumnsFromRichText(value) {
  // Drill through wrapper divs to the element holding the heading/list sequence.
  let content = value;
  while (content.children.length === 1 && content.firstElementChild.matches('div')) {
    content = content.firstElementChild;
  }

  const groups = [];
  [...content.children].forEach((node) => {
    const hasLinks = Boolean(node.querySelector('a'));
    if (node.matches('p, h2, h3, h4, h5, h6') && !hasLinks) {
      groups.push({ heading: node.textContent.trim(), nodes: [] });
    } else if (hasLinks) {
      if (!groups.length) groups.push({ heading: '', nodes: [] });
      groups[groups.length - 1].nodes.push(node);
    }
  });

  const columns = groups.map(({ heading, nodes }) => {
    const container = document.createElement('div');
    container.append(...nodes);
    return buildColumn(heading, container);
  });
  if (columns.length) moveInstrumentation(value, columns[0]);
  return columns;
}

/** The copyright as a slotted <span>, keeping inline markup from a single paragraph. */
function buildCopyright(value) {
  const span = document.createElement('span');
  span.setAttribute('slot', 'copyright');
  moveInstrumentation(value, span);
  const paragraphs = value.querySelectorAll('p');
  if (paragraphs.length === 1) span.append(...paragraphs[0].childNodes);
  else span.textContent = value.textContent.trim();
  return span;
}

/**
 * The banner as a bare slotted <img> (the component styles `::slotted(img)`).
 * The authored <picture>'s responsive sources are folded into the image's
 * srcset (widths from their `width=` parameter) so the full-bleed banner
 * doesn't fall back to the small default rendition.
 */
function buildBannerImage(value) {
  const img = value.querySelector('img');
  if (!img) return null;
  const candidates = [...value.querySelectorAll('source')]
    .filter((source) => !source.type || source.type === 'image/webp')
    .map((source) => {
      const url = source.getAttribute('srcset') || '';
      const width = url.match(/[?&]width=(\d+)/);
      return width ? `${url} ${width[1]}w` : null;
    })
    .filter(Boolean);
  if (candidates.length) {
    img.setAttribute('srcset', [...new Set(candidates)].join(', '));
    img.setAttribute('sizes', '100vw');
  }
  img.setAttribute('slot', 'banner-image');
  img.setAttribute('alt', '');
  img.setAttribute('loading', 'lazy');
  moveInstrumentation(value, img);
  return img;
}

/**
 * The first non-empty result: the child items, then a legacy rich-text field
 * (decorated the same way), then the defaults.
 */
function firstOf(...sources) {
  return sources.map((source) => source()).find((elements) => elements.length) || [];
}

/**
 * Keeps the column <li>s valid in both layouts. On desktop <xe-footer-column>
 * slots them into a <ul>, but its accordion (mobile) layout slots them without
 * one, which leaves orphaned list items (WCAG 1.3.1, axe `listitem`). Drop
 * their list semantics while the accordion layout is active.
 */
function syncListSemantics(footer) {
  footer.querySelectorAll('xe-footer-column > li').forEach((item) => {
    if (ACCORDION_QUERY.matches) item.setAttribute('role', 'none');
    else item.removeAttribute('role');
  });
}

export default async function decorate(block) {
  const fields = readFields(block);
  const footer = document.createElement('xe-footer');

  // --- Logo: the authored image, or Ignite's built-in Xcel Energy logo ---
  const logoPicture = fields.logo && fields.logo.querySelector('picture, img');
  if (logoPicture) {
    // Key-value rows may carry the alt text as its own `logoAlt` row.
    const alt = fields.logoalt && fields.logoalt.textContent.trim();
    const img = logoPicture.querySelector('img') || logoPicture;
    if (alt) img.setAttribute('alt', alt);
    logoPicture.setAttribute('slot', 'logo');
    moveInstrumentation(fields.logo, logoPicture);
    footer.append(logoPicture);
  } else {
    const logo = document.createElement('xe-logo');
    logo.setAttribute('slot', 'logo');
    logo.setAttribute('variant', 'inverse');
    footer.append(logo);
  }

  if (fields.copyright) footer.append(buildCopyright(fields.copyright));

  // --- Link columns (default slot) ---
  let columns = buildSlotColumns(fields);
  if (!columns.length && fields.footerlinks) columns = buildColumnsFromRichText(fields.footerlinks);
  if (columns.length) {
    footer.setAttribute('columns', String(columns.length));
    footer.append(...columns);
  }

  // --- Social and legal links: the child items, decorated by their blocks ---
  footer.append(
    ...firstOf(
      () => fields.items.social.flatMap(decorateSocialLinks),
      () => (fields.social ? decorateSocialLinks(fields.social) : []),
      defaultSocialLinks,
    ),
    ...firstOf(
      () => fields.items.legal.flatMap(decorateLegalLinks),
      () => (fields.legal ? decorateLegalLinks(fields.legal) : []),
      defaultLegalLinks,
    ),
  );

  // --- Banner: background image + centered tagline ---
  const bannerImage = fields['banner-background'] && buildBannerImage(fields['banner-background']);
  if (bannerImage) footer.append(bannerImage);
  const taglineSource = fields['banner-tagline'];
  const taglineText = taglineSource && taglineSource.textContent.trim();
  if (taglineText) {
    const tagline = document.createElement('span');
    tagline.setAttribute('slot', 'tagline');
    tagline.textContent = taglineText;
    if (taglineSource.nodeType === Node.ELEMENT_NODE) moveInstrumentation(taglineSource, tagline);
    footer.append(tagline);
  }

  block.textContent = '';
  block.append(footer);

  // <xe-footer-column> wraps its links in <li>s once it renders; keep their
  // list semantics in step with the layout as they appear and as it changes.
  new MutationObserver(() => syncListSemantics(footer))
    .observe(footer, { childList: true, subtree: true });
  ACCORDION_QUERY.addEventListener('change', () => syncListSemantics(footer));

  // Wait for the components to register so the section reveals the styled
  // footer rather than its unstyled light DOM.
  await loadIgnite(() => Promise.all([
    import('../../scripts/ignite/bundle/compositions/footer/xe-footer.js'),
    import('../../scripts/ignite/bundle/primitives/action/icon-button/xe-icon-button.js'),
  ]));
}
