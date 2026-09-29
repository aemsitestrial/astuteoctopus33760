import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';

/*
 * XE Footer V2
 *
 * The Xcel footer rendered with the @ignite/web footer composition
 * (scripts/ignite/bundle/compositions/footer) instead of block CSS:
 *
 *   <xe-footer columns="3">
 *     <picture slot="logo">…</picture>          (or <xe-logo> when no logo is authored)
 *     <div slot="copyright"><p>© 2026 …</p></div>
 *     <div slot="social"><p><a …><picture>…</picture></a>…</p></div>
 *     <div slot="legal">
 *       <xe-hyperlink variant="variant" href="…">Privacy Policy</xe-hyperlink>…
 *     </div>
 *     <div class="xe-footer-v2-columns">          (display: contents — groups the
 *       <xe-footer-column heading="Company">       legacy columns for UE instrumentation)
 *         <li><xe-hyperlink variant="variant" href="…">About us</xe-hyperlink></li>…
 *       </xe-footer-column>…
 *     </div>
 *     <picture slot="banner-image">…</picture>
 *     <span slot="tagline">Our Energy, Your Power</span>
 *   </xe-footer>
 *
 * The block is a key-value block ("key-value": true in _xe-footer-v2.json):
 * every model field renders as a `name | value` row, so fields are read by
 * name and a blank field can't shift the others. Link columns are fixed slots
 * (column1Heading/column1Links … column5Heading/column5Links); a slot without
 * links is skipped. Footers authored before the switch (positional rows with
 * one `footerlinks` rich-text field) are still read.
 *
 * <xe-footer-column> renders its own heading and slots the links (each in an
 * <li>) into a list; below 1024px it switches to an accordion. Styling comes
 * from the Ignite tokens (loaded by scripts/components/ignite.js);
 * xe-footer-v2.css only covers the authored light-DOM content the components
 * slot in.
 */

// Link-column slots in the model (column1Heading/column1Links … column5…).
const COLUMN_SLOTS = 5;

// Legacy (pre-key-value) footers: single-cell rows in the old model order,
// with the banner (background + tagline, one grouped cell) as the last row.
const LEGACY_FIELDS = ['logo', 'copyright', 'social', 'legal', 'footerlinks'];

// <xe-footer-column>'s accordion breakpoint (it hard-codes this media query).
const ACCORDION_QUERY = window.matchMedia('(max-width: 1024px)');

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

/**
 * Reads the authored fields into `{ normalizedName: valueElement }`.
 * Key-value rows (two cells: name, value) are read by name. Otherwise the rows
 * are the legacy positional layout, mapped onto the same names.
 */
function readFields(block) {
  const rows = [...block.children];
  const fields = {};

  if (rows.some((row) => row.children.length === 2)) {
    rows.forEach((row) => {
      if (row.children.length !== 2) return;
      const [name, value] = row.children;
      const key = toKey(name.textContent);
      if (key && hasContent(value)) fields[key] = value;
    });
    return fields;
  }

  const lastRow = rows[rows.length - 1];
  const bannerRow = rows.length > 1 && lastRow.querySelector('picture, img') ? lastRow : null;
  rows.filter((row) => row !== bannerRow).forEach((row, index) => {
    const name = LEGACY_FIELDS[index];
    if (name && hasContent(row)) fields[name] = cellOf(row);
  });

  if (bannerRow) {
    // Background + tagline share one grouped cell: split them apart.
    const cell = cellOf(bannerRow);
    const background = document.createElement('div');
    background.append(cell.querySelector('picture') || cell.querySelector('img'));
    fields['banner-background'] = background;
    const tagline = [...cell.childNodes].find((node) => node.textContent.trim());
    if (tagline) fields['banner-tagline'] = tagline;
  }
  return fields;
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

/** Moves a value's authored nodes into a new slotted <div>. */
function slotted(name, value) {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('slot', name);
  moveInstrumentation(value, wrapper);
  wrapper.append(...value.childNodes);
  return wrapper;
}

/** Builds an <xe-footer-column> with the links found in `container`, each in an <li>. */
function buildColumn(heading, container) {
  const column = document.createElement('xe-footer-column');
  if (heading) {
    column.setAttribute('heading', heading);
    column.setAttribute('heading-level', '2');
  }
  column.append(...[...container.querySelectorAll('a')].map((anchor) => {
    const item = document.createElement('li');
    item.append(toHyperlink(anchor));
    return item;
  }));
  return column;
}

/** Builds the columns from the key-value slots, skipping slots without links. */
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
 * Builds columns from the legacy `footerlinks` rich text: a flat sequence of
 * heading (<p>/<hN>) + link list pairs, one column per heading. Links before
 * any heading get an untitled column so they are kept.
 */
function buildLegacyColumns(value) {
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

  return groups.map(({ heading, nodes }) => {
    const container = document.createElement('div');
    container.append(...nodes);
    return buildColumn(heading, container);
  });
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

  // --- Link columns (default slot): key-value slots, else legacy rich text ---
  let columns = buildSlotColumns(fields);
  const legacyLinks = !columns.length && fields.footerlinks;
  if (legacyLinks) columns = buildLegacyColumns(legacyLinks);
  if (columns.length) {
    const group = document.createElement('div');
    group.className = 'xe-footer-v2-columns';
    if (legacyLinks) moveInstrumentation(legacyLinks, group);
    group.append(...columns);
    footer.setAttribute('columns', String(columns.length));
    footer.append(group);
  }

  // --- Banner: background image + centered tagline ---
  const background = fields['banner-background'];
  const bannerPicture = background
    && (background.querySelector('picture') || background.querySelector('img'));
  if (bannerPicture) {
    bannerPicture.setAttribute('slot', 'banner-image');
    footer.append(bannerPicture);
  }
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

  syncListSemantics(footer);
  ACCORDION_QUERY.addEventListener('change', () => syncListSemantics(footer));

  // Wait for the components to register so the section reveals the styled
  // footer rather than its unstyled light DOM.
  await loadIgnite(() => import('../../scripts/ignite/bundle/compositions/footer/xe-footer.js'));
}
