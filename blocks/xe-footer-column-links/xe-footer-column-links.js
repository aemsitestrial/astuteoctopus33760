import { hyperlink, keepInstrumentation } from '../../scripts/components/xe-footer-utils.js';
import fetchQueryIndex from '../../scripts/components/query-index.js';

/*
 * XE Footer Link Column — child item of XE Footer V2, one per link column.
 *
 * The item's Heading (text) and Page (aem-content) are grouped (`column_*`)
 * into one cell: <p>Company</p><p><a href="/company">…/company</a></p>.
 * decorateItems(items) turns each into the footer's link column, listing the
 * page's child pages from the query index, which XE Footer V2 slots into
 * <xe-footer>'s default slot:
 *
 *   <xe-footer-column heading="Company">
 *     <xe-hyperlink href="/company/careers" variant="variant">Careers</xe-hyperlink>…
 *   </xe-footer-column>
 *
 * decoratePathColumns(cell, index) does the same for any cell of heading +
 * page path pairs (XE Footer V4's column slots). decorate(item) builds columns
 * from heading + rich-text link lists as authored: XE Footer and V3's
 * rich-text fields, and V2 items created while Links was a rich-text list.
 *
 * The item's Universal Editor instrumentation moves onto the column (or an
 * editor-only placeholder while the item is empty).
 */

/** An <xe-footer-column> with `heading` and the links found in `container`. */
export function buildColumn(heading, container) {
  const column = document.createElement('xe-footer-column');
  if (heading) column.setAttribute('heading', heading);
  column.append(...[...container.querySelectorAll('a')].map((anchor) => hyperlink(anchor)));
  return column;
}

/**
 * Splits a cell holding a sequence of heading (<p>/<hN>) + links into
 * `{ heading, nodes }` groups. Links before any heading get an untitled group,
 * and a heading without links yet yields no group.
 */
function headingGroups(cell) {
  // Drill through the row/cell wrapper divs to the heading/links sequence.
  let content = cell;
  while (content.children.length === 1 && content.firstElementChild.matches('div')) {
    content = content.firstElementChild;
  }

  const groups = [];
  [...content.children].forEach((node) => {
    const hasLinks = Boolean(node.querySelector('a'));
    if (node.matches('p, h2, h3, h4, h5, h6') && !hasLinks && node.textContent.trim()) {
      groups.push({ heading: node.textContent.trim(), nodes: [] });
    } else if (hasLinks) {
      if (!groups.length) groups.push({ heading: '', nodes: [] });
      groups[groups.length - 1].nodes.push(node);
    }
  });
  return groups.filter(({ nodes }) => nodes.length);
}

/**
 * Builds the link column(s) for an item row. The cell is a sequence of heading
 * + link list pairs — one pair for an item; older footers' rich-text footer
 * links hold several, one column each.
 * @param {Element} item the authored item row (or rich-text footer links)
 * @returns {Element[]} the columns to slot into <xe-footer>
 */
export default function decorate(item) {
  const columns = headingGroups(item).map(({ heading, nodes }) => {
    const container = document.createElement('div');
    container.append(...nodes);
    return buildColumn(heading, container);
  });
  return keepInstrumentation(item, columns, null, 'Add a link column');
}

/**
 * The site path a configured link points to: its pathname without `.html` or
 * a trailing slash ('' for the site root). In the Universal Editor links use
 * AEM content paths (/content/…/company.html); those are matched against the
 * index by their trailing segments (see childPages).
 */
function sitePath(href) {
  return new URL(href, window.location.href).pathname
    .replace(/\.html$/, '')
    .replace(/\/(index)?$/, '');
}

/** A readable label from a page path's last segment: /company/net-zero-plan → "Net Zero Plan". */
function labelFromPath(path) {
  const segment = path.split('/').filter(Boolean).pop() || 'Home';
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** True when the page is indexable (its robots metadata doesn't say noindex). */
const isIndexable = (entry) => !/noindex/i.test(entry.robots || '');

/**
 * The site paths a configured path may stand for. A site path stands for
 * itself; an AEM content path (Universal Editor) for each of its trailing
 * parts, longest first, so /content/…/astuteoctopus33760/company → … → /company.
 */
function candidatePaths(base) {
  if (!base.startsWith('/content/')) return [base];
  const segments = base.split('/').filter(Boolean);
  return segments.map((_, start) => `/${segments.slice(start).join('/')}`);
}

/** The indexable direct child pages of `parent` ('' for the site root). */
function childrenOf(parent, index) {
  return index.filter(({ path = '', robots }) => {
    if (!path.startsWith(`${parent}/`)) return false;
    const rest = path.slice(parent.length + 1);
    return rest && !rest.includes('/') && isIndexable({ robots });
  });
}

/** The direct child pages of a configured path in the index, sorted by label. */
function childPages(base, index) {
  const children = candidatePaths(base)
    .map((candidate) => childrenOf(candidate, index))
    .find((list) => list.length) || [];
  return children
    .map((entry) => ({ text: entry.title || labelFromPath(entry.path), href: entry.path }))
    .sort((a, b) => a.text.localeCompare(b.text));
}

/**
 * Builds link columns from heading + page path pairs (a heading followed by a
 * link to a page), listing each path's child pages from the query index. A
 * path without child pages in the index (e.g. nothing under it is published
 * yet) shows a single link to the path itself, labelled with its title.
 * @param {Element} cell the cell holding the heading + path pairs
 * @param {object[]} index the query index entries (see scripts/components/query-index.js)
 * @returns {Element[]} the columns to slot into <xe-footer>
 */
export function decoratePathColumns(cell, index) {
  const columns = headingGroups(cell).map(({ heading, nodes }) => {
    const container = document.createElement('div');
    nodes.flatMap((node) => [...node.querySelectorAll('a')]).forEach((anchor) => {
      const base = sitePath(anchor.getAttribute('href') || '');
      const pages = childPages(base, index);
      if (!pages.length) {
        const page = index.find((entry) => entry.path === (base || '/'));
        pages.push({ text: (page && page.title) || labelFromPath(base), href: anchor.getAttribute('href') });
      }
      pages.forEach(({ text, href }) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        container.append(link);
      });
    });
    return buildColumn(heading, container);
  });
  return keepInstrumentation(cell, columns, null, 'Add a link column');
}

/**
 * True when an item is a heading + page path (the current model) rather than
 * a heading + rich-text link list (items authored before the model changed).
 */
const isPathItem = (item) => !item.querySelector('ul, ol');

/**
 * True when `cell` holds only page path links, as an aem-content field renders
 * them (the link text is the path: /content/…/company), so a path column
 * without a heading can be told apart from a list of named links.
 */
export function isPathLinks(cell) {
  const anchors = [...cell.querySelectorAll('a')];
  return anchors.length > 0
    && anchors.every((anchor) => /^\/\S*$/.test(anchor.textContent.trim()));
}

/**
 * Builds the link columns for XE Footer V2's link column items: page path
 * items list the page's child pages from the query index (fetched only when
 * an item has a path); rich-text link list items render as authored.
 * @param {Element[]} items the authored item rows
 * @returns {Promise<Element[]>} the columns to slot into <xe-footer>
 */
export async function decorateItems(items) {
  const hasPaths = items.some((item) => isPathItem(item) && item.querySelector('a'));
  const index = hasPaths ? await fetchQueryIndex() : [];
  return items.flatMap((item) => (
    isPathItem(item) ? decoratePathColumns(item, index) : decorate(item)
  ));
}
