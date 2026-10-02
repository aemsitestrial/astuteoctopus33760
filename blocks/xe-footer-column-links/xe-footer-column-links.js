import { hyperlink, keepInstrumentation } from '../../scripts/components/xe-footer-utils.js';

/*
 * XE Footer Link Column — child item of XE Footer V2, one per link column.
 *
 * The item's Heading (text) and Links (rich text, a bulleted list) are grouped
 * (`column_*`) into one cell: <p>Company</p><ul><li><a …>…</a></li>…</ul>.
 * decorate(item) turns it into the footer's link column, which XE Footer V2
 * slots into <xe-footer>'s default slot:
 *
 *   <xe-footer-column heading="Company">
 *     <xe-hyperlink href="…" variant="variant">Careers</xe-hyperlink>…
 *   </xe-footer-column>
 *
 * The item's Universal Editor instrumentation moves onto the column (or an
 * editor-only placeholder while the item is empty). The links are a rich-text
 * list rather than a multi-field: multi-fields are an early-access feature and
 * render empty unless Adobe enables them for the program.
 */

/** An <xe-footer-column> with `heading` and the links found in `container`. */
export function buildColumn(heading, container) {
  const column = document.createElement('xe-footer-column');
  if (heading) column.setAttribute('heading', heading);
  column.append(...[...container.querySelectorAll('a')].map((anchor) => hyperlink(anchor)));
  return column;
}

/**
 * Builds the link column(s) for an item row. The cell is a sequence of heading
 * (<p>/<hN>) + link list pairs — one pair for an item; older footers' rich-text
 * footer links hold several, one column each. Links before any heading get an
 * untitled column so they are kept.
 * @param {Element} item the authored item row (or rich-text footer links)
 * @returns {Element[]} the columns to slot into <xe-footer>
 */
export default function decorate(item) {
  // Drill through the row/cell wrapper divs to the heading/list sequence.
  let content = item;
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

  // A heading without links yet renders no column.
  const columns = groups.filter(({ nodes }) => nodes.length).map(({ heading, nodes }) => {
    const container = document.createElement('div');
    container.append(...nodes);
    return buildColumn(heading, container);
  });
  return keepInstrumentation(item, columns, null, 'Add a link column');
}
