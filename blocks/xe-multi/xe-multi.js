import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';

/*
 * XE Multi — a sample block for a composite multi-field: a heading and a list
 * of links, each authored as a Text + URL pair, rendered as Ignite hyperlinks.
 *
 *   <h2 class="xe-multi-heading">Helpful Links</h2>
 *   <ul class="xe-multi-links">
 *     <li><xe-hyperlink href="/pay" trailing-icon link-type="internal">Pay Bill</xe-hyperlink></li>
 *     …
 *   </ul>
 *
 * The model (_xe-multi.json) renders two rows, empty or not:
 *
 *   heading → plain text
 *   links   → a container with "multi": true holding linkText (Text) + link
 *             (URL). The two collapse into one <a> per item (field collapsing
 *             works within multi-field items), so the items render as a list:
 *             <ul><li><a href="URL">Text</a></li>…</ul>. Items that don't
 *             collapse into a single element render as a flat list instead,
 *             separated by <hr>; both are read.
 *
 * Multi-fields are an early-access feature of AEM authoring: Adobe enables
 * them per program, and until then the field renders empty. The block shows
 * an editor-only placeholder while it has no links.
 */

/** The element holding a row's authored content (its single cell). */
function cellOf(row) {
  return row.children.length === 1 ? row.firstElementChild : row;
}

/**
 * The authored items of a multi-field cell: each <li> of a list, or each group
 * of nodes between <hr>s in a flat list.
 * @param {Element} cell the multi-field cell
 * @returns {Element[]} one element per item
 */
function multiItems(cell) {
  const list = cell.querySelector(':scope > ul, :scope > ol');
  if (list) return [...list.children];
  const items = [];
  let item = null;
  [...cell.children].forEach((node) => {
    if (node.matches('hr')) {
      item = null;
      return;
    }
    if (!item) {
      item = document.createElement('div');
      items.push(item);
    }
    item.append(node);
  });
  return items;
}

/**
 * An item's link as `{ text, href, source }`: its <a> (Text + URL collapsed),
 * labelled with the item's text, or the URL when the item has no text.
 */
function readLink(item) {
  const anchor = item.querySelector('a');
  if (!anchor) return null;
  const href = anchor.getAttribute('href') || '';
  const text = anchor.textContent.trim() || item.textContent.trim() || href;
  return { text, href, source: item.matches('li') ? item : anchor };
}

/** An Ignite hyperlink; internal links get a chevron, external ones an arrow. */
function buildLink({ text, href }) {
  const link = document.createElement('xe-hyperlink');
  link.setAttribute('href', href);
  link.setAttribute('trailing-icon', '');
  const external = /^https?:\/\//.test(href) && !href.startsWith(window.location.origin);
  link.setAttribute('link-type', external ? 'external' : 'internal');
  if (external) {
    link.setAttribute('target', '_blank');
    link.setAttribute('aria-label', `${text} (opens in a new window)`);
  }
  link.textContent = text;
  return link;
}

export default async function decorate(block) {
  const [headingRow, linksRow] = [...block.children];
  const headingCell = headingRow && cellOf(headingRow);
  const links = linksRow ? multiItems(cellOf(linksRow)).map(readLink).filter(Boolean) : [];

  const content = [];
  const headingText = headingCell ? headingCell.textContent.trim() : '';
  if (headingText) {
    const heading = document.createElement('h2');
    heading.className = 'xe-multi-heading';
    heading.textContent = headingText;
    moveInstrumentation(headingCell.querySelector('[data-aue-prop]') || headingCell, heading);
    content.push(heading);
  }

  if (links.length) {
    const list = document.createElement('ul');
    list.className = 'xe-multi-links';
    if (linksRow) moveInstrumentation(cellOf(linksRow), list);
    links.forEach((link) => {
      const item = document.createElement('li');
      moveInstrumentation(link.source, item);
      item.append(buildLink(link));
      list.append(item);
    });
    content.push(list);
  } else if (block.hasAttribute('data-aue-resource')) {
    // Universal Editor: keep the empty list visible and selectable.
    const placeholder = document.createElement('p');
    placeholder.className = 'xe-multi-placeholder';
    placeholder.textContent = 'Add links (Text and URL)';
    if (linksRow) moveInstrumentation(cellOf(linksRow), placeholder);
    content.push(placeholder);
  }

  block.replaceChildren(...content);
  if (links.length) {
    await loadIgnite(() => import('../../scripts/ignite/bundle/primitives/action/hyperlink/xe-hyperlink.js'));
  }
}
