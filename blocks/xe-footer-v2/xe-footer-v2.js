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
} from '../xe-footer-legal-links/xe-footer-legal-links.js';
import decorateColumnLinks, { buildColumn } from '../xe-footer-column-links/xe-footer-column-links.js';

/*
 * XE Footer V2
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer), following its reference markup:
 *
 *   <xe-footer columns="5">
 *     <picture slot="logo">…</picture>          (or <xe-logo> when no logo is authored)
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
 * The block is a container (filter `xe-footer-v2`): its own fields (logo +
 * alt, copyright, banner background + tagline) render as rows first, then one
 * row per child item — a link column, a social profile or a legal link. Those
 * items are decorated by their own blocks (xe-footer-column-links /
 * xe-footer-social-links / xe-footer-legal-links); the live Xcel Energy
 * footer's social and legal links render when none are authored.
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

// Universal Editor filters (_xe-footer-v2.json): the block's own, and one
// without the social link item for when the footer already has the most it
// shows, so the editor's (+) menu stops offering it.
const FILTER = 'xe-footer-v2';
const SOCIAL_FULL_FILTER = 'xe-footer-v2-social-full';

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
 * Reads the authored rows into `{ normalizedName: valueElement }` plus
 * `items: { columns: [row…], social: [row…], legal: [row…] }` (item rows are
 * kept whole, since the row carries the item's Universal Editor
 * instrumentation).
 */
function readFields(block) {
  const fields = { items: { columns: [], social: [], legal: [] } };
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
      // A link column item (or an older footer's rich-text footer links).
      addItem('columns', row);
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

  // Universal Editor: with MAX_SOCIAL_LINKS social links already added, switch
  // to the filter without the social link item so (+) no longer offers it.
  // The block is re-rendered with its original filter after every add or
  // remove (scripts/editor-support.js), so this re-evaluates each time.
  // Published pages carry no data-aue-filter; nothing changes there.
  if (block.dataset.aueFilter === FILTER && fields.items.social.length >= MAX_SOCIAL_LINKS) {
    block.dataset.aueFilter = SOCIAL_FULL_FILTER;
  }

  // --- Logo (key-value rows may carry the alt text as its own `logoAlt` row) ---
  footer.append(buildLogo(fields.logo, fields.logoalt && fields.logoalt.textContent.trim()));

  if (fields.copyright) footer.append(buildCopyright(fields.copyright));

  // --- Link columns (default slot): the column items, else a key-value
  // footer's column slots ---
  const columns = firstOf(
    () => fields.items.columns.flatMap(decorateColumnLinks),
    () => buildSlotColumns(fields),
  );
  const columnCount = columns.filter((column) => column.matches('xe-footer-column')).length;
  if (columnCount) footer.setAttribute('columns', String(columnCount));
  footer.append(...columns);

  // --- Social and legal links: the child items, decorated by their blocks
  // (at most MAX_SOCIAL_LINKS social links) ---
  footer.append(
    ...firstOf(
      () => decorateSocialItems(fields.items.social),
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
  const tagline = buildTagline(fields['banner-tagline']);
  footer.append(...[bannerImage, tagline].filter(Boolean));

  await finishFooter(block, footer);
}
