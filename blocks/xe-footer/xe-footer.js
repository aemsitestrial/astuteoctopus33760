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
  const isColumnsRow = (row) => row.querySelector('.columns')
    || row.querySelectorAll('h2, h3').length > 1
    || row.querySelectorAll(':scope > div').length > 1;

  const columnsRows = rows.filter(isColumnsRow);

  const bannerRow = [...rows]
    .reverse()
    .find((row) => !columnsRows.includes(row) && row.querySelector('picture, img'));


  const links = document.createElement('div');
  links.className = 'xe-footer-links-wrapper';

  // Container-field rows, in model order. Keep the FULL positional list (do not
  // filter empties out first) so the model-order → field-name mapping stays
  // stable: dropping an empty row before indexing would shift every later field
  // onto the wrong name.
  const fieldRows = rows.filter((row) => row !== bannerRow && !columnsRows.includes(row));
  fieldRows.forEach((row, index) => {
    const name = CONTAINER_FIELDS[index];
    if (name === "links") {
      links.append(row);
    }
    if (name) row.classList.add(`xe-footer-${name}`);
  });

  // Brand column = logo + copyright + social + legal, grouped so it sits beside
  // the link columns. Only append rows that actually have content, so an unused
  // field does not leave a blank gap — but the naming above already used the
  // stable positional index.
  const brand = document.createElement('div');
  brand.className = 'xe-footer-brand';
  fieldRows
    .filter((row) => !row.classList.contains('xe-footer-links')
      && (row.textContent.trim() || row.querySelector('img, picture, svg')))
    .forEach((row) => brand.append(row));

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
}
