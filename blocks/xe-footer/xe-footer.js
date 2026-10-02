import loadIgnite from '../../scripts/components/ignite.js';
import { buildLogo } from '../../scripts/components/xe-footer-utils.js';

/*
 * XE Footer block
 *
 * Recreates the Xcel footer: a dark maroon content zone (brand column with
 * logo, copyright, social + legal links, alongside the link columns) above a
 * full-bleed solar-panel banner with a centered tagline.
 *
 * The logo isn't authorable: it's Ignite's static <xe-logo> (the Xcel Energy
 * logo, linking to the homepage), loaded from its primitive bundle.
 *
 * EDS does not auto-apply block/item model names as CSS classes, so this
 * decorator classifies each authored row and tags it with a stable hook the
 * stylesheet targets. Container-level fields (copyright, social, legal, links)
 * render first as single-cell rows in model order, followed by the banner and
 * columns items.
 */

const CONTAINER_FIELDS = ['copyright', 'social', 'legal', 'links'];

// From this width up the link columns are static (see xe-footer.css); below it
// each column is an accordion.
const STATIC_COLUMNS = window.matchMedia('(min-width: 700px)');

/**
 * Renders a link column's heading for the current layout, following the
 * accordion pattern: on mobile the heading wraps a <button> toggle that shows
 * or hides its panel (a labelled region); from tablet up the heading is plain
 * text and the panel is always shown — no inert toggle for keyboard and screen
 * reader users to land on. `state` keeps the open/closed choice across
 * breakpoint changes.
 */
function renderColumnHeading(title, panel, state) {
  if (STATIC_COLUMNS.matches) {
    title.textContent = state.label;
    panel.hidden = false;
    panel.removeAttribute('role');
    panel.removeAttribute('aria-labelledby');
    return;
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'xe-footer-links-toggle';
  toggle.textContent = state.label;
  toggle.setAttribute('aria-expanded', String(state.expanded));
  toggle.setAttribute('aria-controls', panel.id);
  toggle.addEventListener('click', () => {
    state.expanded = !state.expanded;
    toggle.setAttribute('aria-expanded', String(state.expanded));
    panel.hidden = !state.expanded;
  });

  title.replaceChildren(toggle);
  panel.hidden = !state.expanded;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', title.id);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Container-level fields (copyright, social, legal, links) render first, in
  // model order, followed by the item rows (banner, one or more columns).
  // Classify structurally rather than by content so empty authored blocks are
  // still recognized (and not silently dropped):
  //   - a columns row is built from the columns component: its cell holds
  //     multiple direct child <div> columns (or a .columns block / several
  //     headings). Every container-field row, by contrast, has a single cell.
  //   - the banner is the LAST remaining image-bearing row.
  //   - the leading rows that are left are the container fields, tagged by
  //     their model order.

  // The static logo leads the logo + copyright group.
  const logoGroup = document.createElement('div');
  logoGroup.className = 'xe-footer-logo-wrapper';
  const logo = buildLogo();
  logo.removeAttribute('slot');
  logo.classList.add('xe-footer-logo');
  logoGroup.append(logo);

  const socialGroup = document.createElement('div');
  socialGroup.className = 'xe-footer-social-wrapper';

  const bannerRow = [...rows]
    .reverse()
    .find((row) => row.querySelector('picture, img'));

  const links = document.createElement('div');
  links.className = 'xe-footer-links-wrapper';

  // Container-field rows, in model order. Keep the FULL positional list (do not
  // filter empties out first) so the model-order → field-name mapping stays
  // stable: dropping an empty row before indexing would shift every later field
  // onto the wrong name.
  const fieldRows = rows.filter((row) => row !== bannerRow);
  const hasContent = (row) => row.textContent.trim() || row.querySelector('img, picture, svg');

  for (let index = 0; index < fieldRows.length; index += 1) {
    const row = fieldRows[index];
    const name = CONTAINER_FIELDS[index];

    if (name === 'links') {
      links.append(row);
    }

    if (name) {
      row.classList.add(`xe-footer-${name}`);
    }
  }

  // Brand column = logo + copyright + social + legal, grouped so it sits beside
  // the link columns. Only append rows that actually have content, so an unused
  // field does not leave a blank gap — but the naming above already used the
  // stable positional index.
  const brand = document.createElement('div');
  brand.className = 'xe-footer-brand';

  const brandRows = fieldRows.filter((row) => !row.classList.contains('xe-footer-links') && hasContent(row));
  const brandGroupMap = new Map([
    ['xe-footer-copyright', logoGroup],
    ['xe-footer-social', socialGroup],
    ['xe-footer-legal', socialGroup],
  ]);

  const appendBrandRow = (row) => {
    const target = [...brandGroupMap.keys()].find((className) => row.classList.contains(className));
    const container = target ? brandGroupMap.get(target) : brand;
    container.append(row);
  };

  brandRows.forEach(appendBrandRow);

  brand.append(logoGroup);
  if (socialGroup.children.length) brand.append(socialGroup);

  // The footer-links field is authored as one cell holding a flat sequence of
  // heading (<p>) + link list (<ul>) pairs. Group each heading with the list
  // that follows it into a column so the stylesheet can lay them out as a grid
  // (one column per heading), matching the design's row of link columns.
  //
  // On mobile the columns collapse into an accordion (collapsed by default so
  // the footer opens compact); from tablet up they are static columns. The
  // heading and panel markup for each layout comes from renderColumnHeading(),
  // re-run whenever the viewport crosses the breakpoint.
  //
  // Drill through the row/cell wrapper divs to the element that actually holds
  // the heading/list sequence (the deepest single-child <div> whose children
  // are the <p>/<ul> content).
  let linksCell = links;
  while (linksCell.children.length === 1 && linksCell.firstElementChild.matches('div')) {
    linksCell = linksCell.firstElementChild;
  }
  const nodes = [...linksCell.children];
  if (nodes.length) {
    const grid = document.createElement('div');
    grid.className = 'xe-footer-links';
    let panel = null;
    let colIndex = 0;
    const headings = [];
    nodes.forEach((node) => {
      const isHeading = node.matches('p, h2, h3, h4') && !node.querySelector('ul, ol');
      if (isHeading) {
        colIndex += 1;
        const column = document.createElement('div');
        column.className = 'xe-footer-links-col';

        // A real heading (the authored level, or h2 for a <p>) keeps the
        // column in the document outline in both layouts.
        const title = document.createElement(node.matches('h2, h3, h4') ? node.localName : 'h2');
        title.className = 'xe-footer-links-title';
        title.id = `xe-footer-links-title-${colIndex}`;

        panel = document.createElement('div');
        panel.className = 'xe-footer-links-content';
        panel.id = `xe-footer-links-panel-${colIndex}`;

        const state = { label: node.textContent.trim(), expanded: false };
        headings.push([title, panel, state]);
        renderColumnHeading(title, panel, state);

        column.append(title, panel);
        grid.append(column);
      } else if (panel) {
        panel.append(node);
      } else {
        // Content before any heading: start an untitled column so it is kept.
        const column = document.createElement('div');
        column.className = 'xe-footer-links-col';
        column.append(node);
        grid.append(column);
        panel = null;
      }
    });
    linksCell.replaceWith(grid);
    STATIC_COLUMNS.addEventListener('change', () => {
      headings.forEach((args) => renderColumnHeading(...args));
    });
  }

  // Content zone wraps the brand column and the link columns side by side.
  const content = document.createElement('div');
  content.className = 'xe-footer-content';
  content.append(brand);

  // Links column wraps the link rows side by side.
  content.append(links);

  // Banner zone: full-bleed image with centered tagline overlay. The banner's
  // background and tagline are grouped fields sharing one cell, but the exact
  // markup varies: the tagline may sit beside the <picture> in the same
  // element, or in a sibling <p>. Tag the image, then find the first
  // text-bearing node in the cell that is not the picture's wrapper and turn
  // its text into the overlay tagline.
  let banner = null;
  if (bannerRow) {
    bannerRow.classList.add('xe-footer-banner');
    const picture = bannerRow.querySelector('picture');
    if (picture) picture.classList.add('xe-footer-banner-image');

    const cell = bannerRow.querySelector(':scope > div') || bannerRow;
    const holdsPicture = (node) => picture && node.contains && node.contains(picture);
    const taglineText = [...cell.childNodes]
      .filter((node) => !holdsPicture(node))
      .map((node) => node.textContent.trim())
      .find((text) => text);

    if (taglineText) {
      // Remove the original tagline node so only the image + overlay remain.
      [...cell.childNodes].forEach((node) => {
        if (!holdsPicture(node) && node.textContent.trim()) node.remove();
      });
      // Append to the banner row itself so the overlay (position:absolute;
      // inset:0) covers the whole full-bleed banner, not just the image cell.
      const tagline = document.createElement('span');
      tagline.className = 'xe-footer-banner-tagline';
      tagline.textContent = taglineText;
      bannerRow.appendChild(tagline);
    }
    banner = bannerRow;
  }

  // Reassemble: content zone first, banner last.
  block.textContent = '';
  block.append(content);
  if (banner) block.append(banner);

  // Register <xe-logo> (and the Ignite tokens it reads).
  loadIgnite(() => import('../../scripts/ignite/bundle/primitives/media/logo/xe-logo.js'));
}
