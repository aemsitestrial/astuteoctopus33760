import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';

/*
 * XE Footer V2
 *
 * Same authoring model as xe-footer, rendered with the @ignite/web footer
 * composition (scripts/ignite/bundle/compositions/footer) instead of block CSS:
 *
 *   <xe-footer columns="3">
 *     <picture slot="logo">…</picture>          (or <xe-logo> when no logo is authored)
 *     <div slot="copyright"><p>© 2026 …</p></div>
 *     <div slot="social"><p><a …><picture>…</picture></a>…</p></div>
 *     <div slot="legal">
 *       <xe-hyperlink variant="variant" href="…">Privacy Policy</xe-hyperlink>…
 *     </div>
 *     <div class="xe-footer-v2-columns">          (display: contents — groups the
 *       <xe-footer-column heading="Company">       columns for UE instrumentation)
 *         <li><xe-hyperlink variant="variant" href="…">About us</xe-hyperlink></li>…
 *       </xe-footer-column>…
 *     </div>
 *     <picture slot="banner-image">…</picture>
 *     <span slot="tagline">Our Energy, Your Power</span>
 *   </xe-footer>
 *
 * <xe-footer-column> renders its own heading and slots the links (each in an
 * <li>) into a list; below 1024px it switches to an accordion. Styling comes from the Ignite
 * tokens (loaded by scripts/components/ignite.js); xe-footer-v2.css only
 * covers the authored light-DOM content the components slot in.
 */

// Leading single-cell rows, in model order (_xe-footer-v2.json). The banner
// (background + tagline, one grouped cell) is always the last row.
const FIELDS = ['logo', 'copyright', 'social', 'legal', 'links'];

// <xe-footer-column>'s accordion breakpoint (it hard-codes this media query).
const ACCORDION_QUERY = window.matchMedia('(max-width: 1024px)');

/** The element holding a row's authored content (its single cell). */
function cellOf(row) {
  return row.children.length === 1 ? row.firstElementChild : row;
}

/** Converts an authored link into an Ignite hyperlink styled for the dark footer. */
function toHyperlink(anchor) {
  const link = document.createElement('xe-hyperlink');
  link.setAttribute('variant', 'variant');
  link.setAttribute('href', anchor.getAttribute('href') || '');
  ['target', 'aria-label'].forEach((name) => {
    if (anchor.hasAttribute(name)) link.setAttribute(name, anchor.getAttribute(name));
  });
  link.textContent = anchor.textContent.trim();
  moveInstrumentation(anchor, link);
  return link;
}

/** Moves a cell's authored nodes into a new slotted <div>. */
function slotted(name, cell) {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('slot', name);
  moveInstrumentation(cell, wrapper);
  wrapper.append(...cell.childNodes);
  return wrapper;
}

/**
 * Builds one <xe-footer-column> per heading in the footer-links cell, which is
 * authored as a flat sequence of heading (<p>/<hN>) + link list pairs. Links
 * that come before any heading get an untitled column so they are kept.
 */
function buildColumns(cell) {
  // Drill through wrapper divs to the element holding the heading/list sequence.
  let content = cell;
  while (content.children.length === 1 && content.firstElementChild.matches('div')) {
    content = content.firstElementChild;
  }

  const columns = [];
  let column = null;
  [...content.children].forEach((node) => {
    const links = [...node.querySelectorAll('a')];
    const isHeading = node.matches('p, h2, h3, h4, h5, h6') && !links.length;
    if (isHeading) {
      column = document.createElement('xe-footer-column');
      column.setAttribute('heading', node.textContent.trim());
      column.setAttribute('heading-level', '2');
      columns.push(column);
      return;
    }
    if (!links.length) return;
    if (!column) {
      column = document.createElement('xe-footer-column');
      columns.push(column);
    }
    column.append(...links.map((anchor) => {
      const item = document.createElement('li');
      item.append(toHyperlink(anchor));
      return item;
    }));
  });
  return columns;
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
  const rows = [...block.children];
  const lastRow = rows[rows.length - 1];
  const bannerRow = rows.length > 1 && lastRow.querySelector('picture, img') ? lastRow : null;

  // Keep the full positional list (empty rows included) so the model-order →
  // field mapping stays stable when an author leaves a field blank.
  const fields = {};
  rows.filter((row) => row !== bannerRow).forEach((row, index) => {
    const name = FIELDS[index];
    if (name && (row.textContent.trim() || row.querySelector('img, picture, svg'))) {
      fields[name] = cellOf(row);
    }
  });

  const footer = document.createElement('xe-footer');

  // --- Logo: the authored image, or Ignite's built-in Xcel Energy logo ---
  const logoPicture = fields.logo && fields.logo.querySelector('picture, img');
  if (logoPicture) {
    logoPicture.setAttribute('slot', 'logo');
    footer.append(logoPicture);
  } else {
    const logo = document.createElement('xe-logo');
    logo.setAttribute('slot', 'logo');
    logo.setAttribute('variant', 'inverse');
    footer.append(logo);
  }

  if (fields.copyright) footer.append(slotted('copyright', fields.copyright));
  if (fields.social) footer.append(slotted('social', fields.social));

  // --- Legal: links become stacked Ignite hyperlinks ---
  if (fields.legal) {
    const legal = document.createElement('div');
    legal.setAttribute('slot', 'legal');
    moveInstrumentation(fields.legal, legal);
    legal.append(...[...fields.legal.querySelectorAll('a')].map(toHyperlink));
    footer.append(legal);
  }

  // --- Link columns (default slot) ---
  if (fields.links) {
    const columns = buildColumns(fields.links);
    const group = document.createElement('div');
    group.className = 'xe-footer-v2-columns';
    moveInstrumentation(fields.links, group);
    group.append(...columns);
    footer.setAttribute('columns', String(Math.max(columns.length, 1)));
    footer.append(group);
  }

  // --- Banner: background image + tagline share the last row's cell ---
  if (bannerRow) {
    const cell = cellOf(bannerRow);
    const picture = cell.querySelector('picture') || cell.querySelector('img');
    picture.setAttribute('slot', 'banner-image');
    footer.append(picture);

    const taglineNode = [...cell.childNodes].find((node) => node.textContent.trim());
    if (taglineNode) {
      const tagline = document.createElement('span');
      tagline.setAttribute('slot', 'tagline');
      tagline.textContent = taglineNode.textContent.trim();
      if (taglineNode.nodeType === Node.ELEMENT_NODE) moveInstrumentation(taglineNode, tagline);
      footer.append(tagline);
    }
  }

  block.textContent = '';
  block.append(footer);

  syncListSemantics(footer);
  ACCORDION_QUERY.addEventListener('change', () => syncListSemantics(footer));

  // Wait for the components to register so the section reveals the styled
  // footer rather than its unstyled light DOM.
  await loadIgnite(() => import('../../scripts/ignite/bundle/compositions/footer/xe-footer.js'));
}
