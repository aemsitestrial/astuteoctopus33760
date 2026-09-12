/*
 * XE Footer block
 * Full-bleed footer: the banner row spans the full viewport width while the
 * remaining rows (copyright, columns) stay within the standard reading width.
 *
 * EDS does not auto-apply block/item model names as CSS classes, so this
 * decorator tags each row with a stable class the stylesheet can target:
 *   - the banner row (the only item authored with a background image) gets
 *     .xe-footer-banner and breaks out to full width;
 *   - every other row gets .xe-footer-content and keeps the 1200px cap.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // The XE Footer Banner item is the only one modeled with a background
    // image (a <picture>/<img>); use that to distinguish it from the
    // copyright and columns rows.
    if (row.querySelector('picture, img')) {
      row.classList.add('xe-footer-banner');

      // The banner's background and tagline are grouped fields, so they render
      // into the same cell: a <picture> followed by the tagline text. Tag the
      // <picture> and wrap the tagline in an element so each can be styled
      // (full-bleed image + centered tagline overlay).
      const picture = row.querySelector('picture');
      if (picture) picture.classList.add('xe-footer-banner-image');

      const cell = picture ? picture.parentElement : row.firstElementChild;
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
    } else {
      row.classList.add('xe-footer-content');
    }
  });
}
