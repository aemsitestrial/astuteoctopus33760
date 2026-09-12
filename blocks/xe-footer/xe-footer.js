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

const CONTAINER_FIELDS = ['logo', 'copyright', 'social', 'legal'];

export default function decorate(block) {
  const rows = [...block.children];

  // Container-level fields (logo, copyright, social, legal) render first, in
  // model order, followed by the item rows (banner, columns). Classify from
  // both ends so the logo — which also contains an image — is never mistaken
  // for the banner:
  //   - the columns item is the row built from the columns component
  //     (multiple headings / a nested columns block);
  //   - the banner item is the LAST remaining image-bearing row (the logo is
  //     row 0, a leading field, so it is excluded here);
  //   - the leading rows that are left are the container fields, tagged by
  //     their model order.
  const columnsRow = rows.find((row) => row.querySelector('.columns')
    || row.querySelectorAll('h2, h3').length > 1);

  const bannerRow = [...rows]
    .reverse()
    .find((row) => row !== columnsRow && row.querySelector('picture, img'));

  const fieldRows = rows.filter((row) => row !== bannerRow && row !== columnsRow);
  fieldRows.forEach((row, index) => {
    const name = CONTAINER_FIELDS[index];
    if (name) row.classList.add(`xe-footer-${name}`);
  });

  // Brand column = logo + copyright + social + legal, grouped so it sits beside
  // the link columns in the content zone.
  const brand = document.createElement('div');
  brand.className = 'xe-footer-brand';
  fieldRows.forEach((row) => brand.append(row));

  // Content zone wraps the brand column and the link columns side by side.
  const content = document.createElement('div');
  content.className = 'xe-footer-content';
  content.append(brand);
  if (columnsRow) {
    columnsRow.classList.add('xe-footer-columns');
    content.append(columnsRow);
  }

  // Banner zone: full-bleed image with centered tagline overlay. The banner's
  // background and tagline are grouped fields sharing one cell (a <picture>
  // followed by tagline text), so tag the image and wrap the tagline text.
  let banner = null;
  if (bannerRow) {
    bannerRow.classList.add('xe-footer-banner');
    const picture = bannerRow.querySelector('picture');
    if (picture) picture.classList.add('xe-footer-banner-image');

    const cell = picture ? picture.parentElement : bannerRow.firstElementChild;
    [...(cell?.childNodes || [])].forEach((node) => {
      const isText = node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      const isInline = node.nodeType === Node.ELEMENT_NODE
        && !node.matches('picture, img')
        && node.textContent.trim();
      if (isText || isInline) {
        const tagline = document.createElement('span');
        tagline.className = 'xe-footer-banner-tagline';
        tagline.textContent = node.textContent.trim();
        node.replaceWith(tagline);
      }
    });
    banner = bannerRow;
  }

  // Reassemble: content zone first, banner last.
  block.textContent = '';
  block.append(content);
  if (banner) block.append(banner);
}
