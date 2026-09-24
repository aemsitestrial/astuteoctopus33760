/*
 * XE Footer block
 *
 * Recreates the Xcel footer: a dark maroon content zone (brand column with
 * logo, copyright, social + legal links, alongside the link columns) above a
 * full-bleed solar-panel banner with a centered tagline.
 *
 * EDS does not auto-apply block/item model names as CSS classes, so this
 * decorator classifies each authored row and tags it with a stable hook the
 * stylesheet targets. Container-level fields (logo, copyright, social, legal)
 * render first as single-cell rows in model order, followed by the banner and
 * columns items.
 */

const CONTAINER_FIELDS = ['logo', 'copyright', 'social', 'legal', 'links'];

export default function decorate(block) {
  const rows = [...block.children];

  // Container-level fields (logo, copyright, social, legal) render first, in
  // model order, followed by the item rows (banner, one or more columns).
  // Classify structurally rather than by content so empty authored blocks are
  // still recognized (and not silently dropped):
  //   - a columns row is built from the columns component: its cell holds
  //     multiple direct child <div> columns (or a .columns block / several
  //     headings). Every container-field row, by contrast, has a single cell.
  //   - the banner is the LAST remaining image-bearing row (the logo, row 0,
  //     is a leading field, so it is excluded here).
  //   - the leading rows that are left are the container fields, tagged by
  //     their model order.

  const logoGroup = document.createElement('div');
  logoGroup.className = 'xe-footer-v2-logo-wrapper';

  const socialGroup = document.createElement('div');
  socialGroup.className = 'xe-footer-v2-social-wrapper';

  const bannerRow = [...rows]
    .reverse()
    .find((row) => row.querySelector('picture, img'));

  const links = document.createElement('div');
  links.className = 'xe-footer-v2-links-wrapper';

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
      row.classList.add(`xe-footer-v2-${name}`);
    }
  }

  // Brand column = logo + copyright + social + legal, grouped so it sits beside
  // the link columns. Only append rows that actually have content, so an unused
  // field does not leave a blank gap — but the naming above already used the
  // stable positional index.
  const brand = document.createElement('div');
  brand.className = 'xe-footer-v2-brand';

  const brandRows = fieldRows.filter((row) => !row.classList.contains('xe-footer-v2-links') && hasContent(row));
  const brandGroupMap = new Map([
    ['xe-footer-v2-logo', logoGroup],
    ['xe-footer-v2-copyright', logoGroup],
    ['xe-footer-v2-social', socialGroup],
    ['xe-footer-v2-legal', socialGroup],
  ]);

  const appendBrandRow = (row) => {
    const target = [...brandGroupMap.keys()].find((className) => row.classList.contains(className));
    const container = target ? brandGroupMap.get(target) : brand;
    container.append(row);
  };

  brandRows.forEach(appendBrandRow);

  if (logoGroup.children.length) brand.append(logoGroup);
  if (socialGroup.children.length) brand.append(socialGroup);

  // The footer-links field is authored as one cell holding a flat sequence of
  // heading (<p>) + link list (<ul>) pairs. Group each heading with the list
  // that follows it into a column so the stylesheet can lay them out as a grid
  // (one column per heading), matching the design's row of link columns.
  //
  // On mobile the columns collapse into an accordion: the heading becomes a
  // <button> toggle that expands/collapses its link list (each list lives in a
  // dedicated `.xe-footer-v2-links-content` panel wired to the button via
  // aria-controls/aria-expanded). Desktop CSS forces every panel open and
  // neutralises the toggle, so the same markup serves both layouts.
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
    grid.className = 'xe-footer-v2-links';
    let panel = null;
    let colIndex = 0;
    nodes.forEach((node) => {
      const isHeading = node.matches('p, h2, h3, h4') && !node.querySelector('ul, ol');
      if (isHeading) {
        colIndex += 1;
        const column = document.createElement('div');
        column.className = 'xe-footer-v2-links-col';

        const titleId = `xe-footer-v2-links-title-${colIndex}`;
        const panelId = `xe-footer-v2-links-panel-${colIndex}`;

        // Accessible accordion toggle. Collapsed by default so the mobile
        // footer opens compact; desktop CSS overrides this to always-open.
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'xe-footer-v2-links-title';
        toggle.id = titleId;
        toggle.textContent = node.textContent.trim();
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', panelId);

        panel = document.createElement('div');
        panel.className = 'xe-footer-v2-links-content';
        panel.id = panelId;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', titleId);

        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
        });

        column.append(toggle, panel);
        grid.append(column);
      } else if (panel) {
        panel.append(node);
      } else {
        // Content before any heading: start an untitled column so it is kept.
        const column = document.createElement('div');
        column.className = 'xe-footer-v2-links-col';
        column.append(node);
        grid.append(column);
        panel = null;
      }
    });
    linksCell.replaceWith(grid);
  }

  // Content zone wraps the brand column and the link columns side by side.
  const content = document.createElement('div');
  content.className = 'xe-footer-v2-content';
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
    bannerRow.classList.add('xe-footer-v2-banner');
    const picture = bannerRow.querySelector('picture');
    if (picture) picture.classList.add('xe-footer-v2-banner-image');

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
      tagline.className = 'xe-footer-v2-banner-tagline';
      tagline.textContent = taglineText;
      bannerRow.appendChild(tagline);
    }
    banner = bannerRow;
  }

  // Reassemble: content zone first, banner last.
  block.textContent = '';
  block.append(content);
  if (banner) block.append(banner);
}
