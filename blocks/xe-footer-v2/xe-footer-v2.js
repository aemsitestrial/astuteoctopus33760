import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';

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
 *     <xe-icon-button slot="social" size="xl" href="…" aria-label="Facebook …">
 *       <xe-icon icon="faSquareFacebook"></xe-icon>
 *     </xe-icon-button>…
 *     <xe-hyperlink slot="legal" href="…" variant="variant" trailing-icon>Privacy</xe-hyperlink>…
 *     <img slot="banner-image" src="…" alt="">
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
 * Social and legal links come from the block's child items
 * (xe-footer-social-links: network + profile URL; xe-footer-legal-links:
 * text + link), falling back to the `social` / `legal` rich-text fields, and
 * then to the live Xcel Energy footer's links (DEFAULT_SOCIAL_LINKS /
 * DEFAULT_LEGAL_LINKS) when none are authored.
 *
 * Universal Editor: the editor's content tree and selection come from the
 * data-aue-* instrumentation in the DOM, so every authored row's
 * instrumentation is moved onto the element rendered from it (see
 * keepInstrumentation). Each child item keeps its own; an item that has no
 * links yet renders an editor-only placeholder rather than disappearing.
 *
 * <xe-footer-column> wraps each link in an <li> inside its list; below 1024px
 * it switches to an accordion. Styling comes from the Ignite tokens (loaded by
 * scripts/components/ignite.js); xe-footer-v2.css only covers authored
 * light-DOM content that page-level rules would otherwise restyle.
 */

// Link-column slots in the model (column1Heading/column1Links … column5…).
const COLUMN_SLOTS = 5;

// Legacy (pre-key-value) footers: single-cell rows in the old model order,
// with the banner (background + tagline, one grouped cell) as the last row.
const LEGACY_FIELDS = ['logo', 'copyright', 'social', 'legal', 'footerlinks'];

// <xe-footer-column>'s accordion breakpoint (it hard-codes this media query).
const ACCORDION_QUERY = window.matchMedia('(max-width: 1024px)');

// Social networks, keyed by the xe-footer-social-links "Network" value, with
// their icon (scripts/components/icons.js). `match` also recognizes a network
// from its profile URL or a free-text label.
const SOCIAL_NETWORKS = {
  facebook: { label: 'Facebook', icon: 'faSquareFacebook', match: /facebook/i },
  x: { label: 'X', icon: 'faSquareXTwitter', match: /^x$|twitter|(^|\/\/|\.)x\.com/i },
  instagram: { label: 'Instagram', icon: 'faInstagram', match: /instagram/i },
  linkedin: { label: 'LinkedIn', icon: 'faSquareLinkedin', match: /linkedin/i },
  youtube: { label: 'YouTube', icon: 'faYoutube', match: /youtube/i },
};

// Child item models (the xe-footer-v2 filter) → the footer area they fill,
// and their multi-field names, which identify them if AEM renders the items
// as key-value rows.
const ITEM_MODELS = {
  'xe-footer-social-links': 'social',
  'xe-footer-legal-links': 'legal',
};
const ITEM_KEYS = { sociallinks: 'social', legallinks: 'legal' };

// Rendered when no social / legal links are authored (the live Xcel Energy footer's).
const DEFAULT_SOCIAL_LINKS = [
  ['facebook', 'https://www.facebook.com/XcelEnergy'],
  ['x', 'https://twitter.com/XcelEnergy'],
  ['instagram', 'https://www.instagram.com/xcelenergy'],
  ['linkedin', 'https://www.linkedin.com/company/xcel-energy'],
  ['youtube', 'https://www.youtube.com/XcelEnergyVideo'],
];
const DEFAULT_LEGAL_LINKS = [
  ['Online Terms of Use', 'https://www.xcelenergy.com/staticfiles/xe-responsive/Admin/My%20Account_Terms_and_Conditions.pdf'],
  ['Privacy', 'https://my.xcelenergy.com/s/privacy'],
  ['Accessibility', 'https://corporate.my.xcelenergy.com/s/about/accessibility'],
];

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
 * The network key for a social link (or null), from its text, its accessible
 * name or icon alt text (icon-only rich-text links), or its URL.
 */
function socialNetwork(anchor) {
  const img = anchor.querySelector('img');
  const names = [anchor.textContent, anchor.getAttribute('aria-label'), img && img.alt]
    .map((name) => (name || '').trim())
    .filter(Boolean);
  const href = anchor.getAttribute('href') || '';
  const found = Object.entries(SOCIAL_NETWORKS).find(([key, { match }]) => match.test(href)
    || names.some((name) => name.toLowerCase() === key || match.test(name)));
  return found ? found[0] : null;
}

/**
 * Which footer area ('social' | 'legal') a child item row fills, or null.
 * In the Universal Editor the row is instrumented with its model
 * (`data-aue-model`), which is exact. On published pages the row carries no
 * such hint: an item rendered as a key-value row is known by its field name,
 * otherwise a list whose links all point to social networks is the social
 * list and any other list of links is the legal list.
 */
function itemKind(row, key) {
  const model = row.getAttribute('data-aue-model');
  if (ITEM_MODELS[model]) return ITEM_MODELS[model];
  if (ITEM_KEYS[key]) return ITEM_KEYS[key];
  const links = [...row.querySelectorAll('a')];
  if (!links.length) return null;
  return links.every((anchor) => socialNetwork(anchor)) ? 'social' : 'legal';
}

/**
 * Reads the authored fields into `{ normalizedName: valueElement }`, plus
 * `items: { social: [row…], legal: [row…] }` for the child item rows (kept
 * whole, since the row carries the item's Universal Editor instrumentation).
 * Key-value rows (two cells: name, value) are read by name. Otherwise the rows
 * are the legacy positional layout, mapped onto the same names.
 */
function readFields(block) {
  const rows = [...block.children];
  const fields = { items: { social: [], legal: [] } };
  const isItemModel = (row) => Boolean(ITEM_MODELS[row.getAttribute('data-aue-model')]);

  if (rows.some((row) => row.children.length === 2 || isItemModel(row))) {
    rows.forEach((row) => {
      const key = row.children.length === 2 ? toKey(row.firstElementChild.textContent) : '';
      if (isItemModel(row) || ITEM_KEYS[key] || row.children.length === 1) {
        const kind = itemKind(row, key);
        if (kind) fields.items[kind].push(row);
        return;
      }
      const value = row.children[1];
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

/**
 * An Ignite hyperlink styled for the dark footer, from an authored link or a
 * `[text, href]` default. `slot` / `trailingIcon` place it in the legal area.
 */
function hyperlink(source, { slot, trailingIcon } = {}) {
  const link = document.createElement('xe-hyperlink');
  if (slot) link.setAttribute('slot', slot);
  link.setAttribute('variant', 'variant');
  if (trailingIcon) link.setAttribute('trailing-icon', '');
  if (Array.isArray(source)) {
    const [text, href] = source;
    link.setAttribute('href', href);
    link.textContent = text;
    return link;
  }
  link.setAttribute('href', source.getAttribute('href') || '');
  ['target', 'aria-label'].forEach((name) => {
    if (source.hasAttribute(name)) link.setAttribute(name, source.getAttribute(name));
  });
  link.textContent = source.textContent.trim();
  moveInstrumentation(source, link);
  return link;
}

/** An Ignite icon button linking to a social profile in a new window. */
function socialButton(network, href) {
  const { label, icon } = SOCIAL_NETWORKS[network];
  const button = document.createElement('xe-icon-button');
  button.setAttribute('slot', 'social');
  button.setAttribute('size', 'xl');
  button.setAttribute('href', href);
  button.setAttribute('target', '_blank');
  button.setAttribute('aria-label', `${label} (opens in a new window)`);
  const glyph = document.createElement('xe-icon');
  glyph.setAttribute('icon', icon);
  button.append(glyph);
  return button;
}

/**
 * Keeps a source's Universal Editor instrumentation in the rendered footer by
 * moving it onto the first element built from it, so the item or field stays
 * in the editor's content tree and can be selected. A child item with nothing
 * to render yet (just added, no links) gets an editor-only placeholder instead
 * of disappearing; on published pages there is no instrumentation, so nothing
 * is added.
 */
function keepInstrumentation(source, elements, slot, placeholderText) {
  if (elements.length) {
    moveInstrumentation(source, elements[0]);
    return elements;
  }
  if (!source.hasAttribute('data-aue-resource')) return elements;
  const placeholder = document.createElement('span');
  placeholder.setAttribute('slot', slot);
  placeholder.className = 'xe-footer-v2-placeholder';
  placeholder.textContent = placeholderText;
  moveInstrumentation(source, placeholder);
  return [placeholder];
}

/** Social icon buttons for the links in `source`; unrecognized networks stay as authored links. */
function socialButtons(source) {
  return [...source.querySelectorAll('a')].map((anchor) => {
    const network = socialNetwork(anchor);
    if (network) return socialButton(network, anchor.getAttribute('href') || '');
    anchor.setAttribute('slot', 'social');
    return anchor;
  });
}

/**
 * The social icon buttons: from the xe-footer-social-links items, else the
 * legacy `social` rich text, else the default networks.
 */
function buildSocial(fields) {
  const fromItems = fields.items.social
    .flatMap((row) => keepInstrumentation(row, socialButtons(row), 'social', 'Add social links'));
  if (fromItems.length) return fromItems;
  if (fields.social) return keepInstrumentation(fields.social, socialButtons(fields.social));
  return DEFAULT_SOCIAL_LINKS.map(([network, href]) => socialButton(network, href));
}

/**
 * The legal links (each an Ignite hyperlink with a trailing icon): from the
 * xe-footer-legal-links items, else the legacy `legal` rich text, else the
 * default legal links.
 */
function buildLegal(fields) {
  const options = { slot: 'legal', trailingIcon: true };
  const links = (source) => [...source.querySelectorAll('a')].map((a) => hyperlink(a, options));
  const fromItems = fields.items.legal
    .flatMap((row) => keepInstrumentation(row, links(row), 'legal', 'Add legal links'));
  if (fromItems.length) return fromItems;
  if (fields.legal) return keepInstrumentation(fields.legal, links(fields.legal));
  return DEFAULT_LEGAL_LINKS.map((link) => hyperlink(link, options));
}

/** An <xe-footer-column> holding the links found in `container`. */
function buildColumn(heading, container) {
  const column = document.createElement('xe-footer-column');
  if (heading) column.setAttribute('heading', heading);
  column.append(...[...container.querySelectorAll('a')].map((anchor) => hyperlink(anchor)));
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

  // --- Link columns (default slot): key-value slots, else legacy rich text ---
  let columns = buildSlotColumns(fields);
  if (!columns.length && fields.footerlinks) columns = buildLegacyColumns(fields.footerlinks);
  if (columns.length) {
    footer.setAttribute('columns', String(columns.length));
    footer.append(...columns);
  }

  // --- Social and legal links (authored items, legacy rich text, or defaults) ---
  footer.append(...buildSocial(fields), ...buildLegal(fields));

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
