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
    } else {
      row.classList.add('xe-footer-content');
    }
  });
}
