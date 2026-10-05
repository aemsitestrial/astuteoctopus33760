import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  buildBannerImage, buildCopyright, buildLogo, buildTagline, finishFooter, firstOf,
} from '../../scripts/components/xe-footer-utils.js';
import decorateSocialLinks, {
  decorateDefaults as defaultSocialLinks,
  decorateItems as decorateSocialItems,
  isSocialLinks,
  MAX_SOCIAL_LINKS,
} from '../xe-footer-social-links/xe-footer-social-links.js';
import decorateLegalLinks, {
  decorateDefaults as defaultLegalLinks,
  decorateItems as decorateLegalItems,
  MAX_LEGAL_LINKS,
} from '../xe-footer-legal-links/xe-footer-legal-links.js';
import {
  buildColumn,
  decorateItems as decorateColumnItems,
  isPathLinks,
  MAX_COLUMN_LINKS,
} from '../xe-footer-column-links/xe-footer-column-links.js';

/*
 * XE Footer V2
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer), following its reference markup:
 *
 *   <xe-footer columns="5">
 *     <xe-logo slot="logo" variant="inverse" size="md" href="/" label="Xcel Energy Home"></xe-logo>
 *     <span slot="copyright">© 2026 Xcel Energy Inc. All rights reserved.</span>
 *     <xe-footer-column heading="Company">                    (xe-footer-column-links)
 *       <xe-hyperlink href="…" variant="variant">Careers</xe-hyperlink>…
 *     </xe-footer-column>…
 *     <xe-icon-button slot="social" …>…</xe-icon-button>…       (xe-footer-social-links)
 *     <xe-hyperlink slot="legal" … trailing-icon>…</xe-hyperlink>… (xe-footer-legal-links)
 *     <img slot="banner-image" src="…" alt="">
 *     <span slot="tagline">Our Energy, Your Power</span>
 *   </xe-footer>
 *
 * The block is a container (filter `xe-footer-v2`): its own fields
 * (banner background + tagline) render as a row first, then one
 * row per child item — a link column, a social profile or a legal link. Those
 * items are decorated by their own blocks (xe-footer-column-links /
 * xe-footer-social-links / xe-footer-legal-links); the live Xcel Energy
 * footer's social and legal links render when none are authored. A link
 * column item is a heading + page: the column lists the page's published
 * child pages from the query index (/query-index.json), or a single link to
 * the page when it has none; items authored as a rich-text link list render
 * as authored.
 *
 * Rows are recognized by what they hold rather than by position, so blank
 * fields can't shift the others and older footers still render: key-value
 * rows (`name | value`, footers created while the block was key-value) by
 * name, a row instrumented with an item model (Universal Editor) as that item,
 * a row of only links as an item, headings + link lists as link columns, and
 * images / text as the banner. The logo and the copyright are static (not
 * authorable): Ignite's Xcel Energy logo, linking to the homepage, and
 * "© <current year> Xcel Energy Inc. All rights reserved."
 *
 * <xe-footer-column> wraps each link in an <li> inside its list; below 1024px
 * it switches to an accordion. Styling comes from the Ignite tokens (loaded by
 * scripts/components/ignite.js); xe-footer-v2.css only covers authored
 * light-DOM content that page-level rules would otherwise restyle.
 */

// Link-column slots of key-value footers (column1Heading/column1Links … column5…).
const COLUMN_SLOTS = 5;

// Universal Editor filters (_xe-footer-v2.json): the block's own, and one per
// combination of child items the footer already has the most of it shows,
// without those items, so the editor's (+) menu stops offering them:
// xe-footer-v2-{columns-}{social-}{legal-}full (e.g. xe-footer-v2-social-full).
const FILTER = 'xe-footer-v2';

// The most items of each kind the footer shows (the kinds in filter-name order).
const ITEM_LIMITS = {
  columns: MAX_COLUMN_LINKS,
  social: MAX_SOCIAL_LINKS,
  legal: MAX_LEGAL_LINKS,
};

// Child item models (the xe-footer-v2 filter) → the footer area they fill.
const ITEM_MODELS = {
  'xe-footer-column-links': 'columns',
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
 * True when an image in a footer's first row is an older footer's authored
 * logo rather than the banner: it's named a logo, or another image follows.
 */
function isLegacyLogo(image, imageCount) {
  const img = image.matches('img') ? image : image.querySelector('img');
  const name = img ? `${img.getAttribute('src') || ''} ${img.getAttribute('alt') || ''}` : '';
  return imageCount > 1 || /logo/i.test(name);
}

/** True when a text row is an older footer's authored copyright line. */
function isCopyright(cell) {
  return /^\s*(©|\(c\)|copyright\b)|all rights reserved/i.test(cell.textContent);
}

/**
 * Reads the authored rows into `{ normalizedName: valueElement }` plus
 * `items: { columns: [row…], social: [row…], legal: [row…] }` (item rows are
 * kept whole, since the row carries the item's Universal Editor
 * instrumentation).
 */
function readFields(block) {
  const fields = { items: { columns: [], social: [], legal: [] } };
  const addItem = (kind, row) => fields.items[kind].push(row);
  const rows = [...block.children];
  const imageRows = rows.filter((row) => row.querySelector('picture, img'));

  rows.forEach((row, index) => {
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
    // link lists are checked before the banner.
    const cell = cellOf(row);
    if (!hasContent(cell)) return;
    const image = cell.querySelector('picture, img');
    const linkList = isLinkList(cell);
    if (linkList && isPathLinks(cell)) {
      // A link column item without a heading: just its page path.
      addItem('columns', row);
    } else if (linkList && (!image || isSocialLinks(cell))) {
      addItem(isSocialLinks(cell) ? 'social' : 'legal', row);
    } else if (image) {
      // The banner (image + tagline), the current model's first row. The logo
      // isn't authorable any more; older footers held it in their first row,
      // so an image there that is a logo, or is followed by another image (the
      // banner), is skipped.
      if (index === 0 && isLegacyLogo(image, imageRows.length)) return;
      fields['banner-background'] = cell;
      const tagline = [...cell.childNodes].find((node) => node.textContent.trim());
      if (tagline) fields['banner-tagline'] = tagline;
    } else if (isLinkColumns(cell)) {
      // A link column item (or an older footer's rich-text footer links).
      addItem('columns', row);
    } else if (fields['banner-background'] || fields['banner-tagline']) {
      // Past the banner only child items follow (model order); one without a
      // link yet (e.g. a network chosen but no URL) renders nothing.
    } else if (!isCopyright(cell)) {
      // The banner's tagline without a background image. (The copyright isn't
      // authorable any more: an older footer's copyright row is skipped.)
      fields['banner-tagline'] = cell;
    }
  });
  return fields;
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

export default async function decorate(block) {
  const fields = readFields(block);
  const footer = document.createElement('xe-footer');

  // Universal Editor: for each kind of child item already at its limit, switch
  // to the filter without it so (+) no longer offers it. The block is
  // re-rendered with its original filter after every add or remove
  // (scripts/editor-support.js), so this re-evaluates each time. Published
  // pages carry no data-aue-filter; nothing changes there.
  const full = Object.keys(ITEM_LIMITS)
    .filter((kind) => fields.items[kind].length >= ITEM_LIMITS[kind]);
  if (block.dataset.aueFilter === FILTER && full.length) {
    block.dataset.aueFilter = `${FILTER}-${full.join('-')}-full`;
  }

  // --- Logo: the static Xcel Energy logo, linking to the homepage ---
  footer.append(buildLogo());

  // --- Copyright: static, with the current year ---
  footer.append(buildCopyright());

  // --- Link columns (default slot): the column items (at most
  // MAX_COLUMN_LINKS, each listing its page's child pages from the query
  // index), else a key-value footer's column slots ---
  const itemColumns = await decorateColumnItems(fields.items.columns);
  const columns = firstOf(() => itemColumns, () => buildSlotColumns(fields));
  const columnCount = columns.filter((column) => column.matches('xe-footer-column')).length;
  if (columnCount) footer.setAttribute('columns', String(columnCount));
  footer.append(...columns);

  // --- Social and legal links: the child items, decorated by their blocks
  // (at most MAX_SOCIAL_LINKS social links and MAX_LEGAL_LINKS legal items) ---
  footer.append(
    ...firstOf(
      () => decorateSocialItems(fields.items.social),
      () => (fields.social ? decorateSocialLinks(fields.social) : []),
      defaultSocialLinks,
    ),
    ...firstOf(
      () => decorateLegalItems(fields.items.legal),
      () => (fields.legal ? decorateLegalLinks(fields.legal) : []),
      defaultLegalLinks,
    ),
  );

  // --- Banner: background image + centered tagline ---
  const bannerImage = fields['banner-background'] && buildBannerImage(fields['banner-background']);
  const tagline = buildTagline(fields['banner-tagline']);
  footer.append(...[bannerImage, tagline].filter(Boolean));

  await finishFooter(block, footer);
}
