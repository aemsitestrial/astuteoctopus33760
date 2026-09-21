/*
 * Block field maps for the Adobe Target integration.
 *
 * A field map is `{ offerFieldName: resolver }` (see applyField in dom.js for
 * resolver shapes). These map the block's MODEL property names — what an author
 * sees in the block model — to the stable, post-decoration anchors each block
 * emits. They are shared between the block-level FORM_BASED_HANDLERS entry and
 * the Intent Section handlers so offer field names stay identical either way.
 */

import { setPictureImage, setXeButtonHref } from './dom.js';

// hero-v3 personalizable fields, keyed by the block's MODEL property names
// (blocks/hero-v3/_hero-v3.json) → the post-decoration selector each maps to.
// `heading` is kept as a back-compat alias for `title`.
export const HERO_V3_FIELDS = {
  // Text fields (set textContent).
  title: '.hero-title',
  heading: '.hero-title',
  subtitle: '.hero-subtitle',
  primaryCta: '.hero-actions a.hero-action-primary',
  secondaryCta: '.hero-actions a.hero-action-static-light',
  // Link fields (set the CTA href; URL-safety-checked).
  primaryCtaLink: { selector: '.hero-actions a.hero-action-primary', attr: 'href' },
  secondaryCtaLink: { selector: '.hero-actions a.hero-action-static-light', attr: 'href' },
  // Image field (swap the background image; handles the <picture> sources).
  image: { selector: '.hero-media img', apply: setPictureImage },
};

// xe-hero personalizable fields, keyed by the block's MODEL property names
// (blocks/xe-hero/_xe-hero.json) → the post-decoration selector each maps to.
// xe-hero renders web components (<xe-hero>/<xe-button>) but title/subtitle/
// media/CTA are SLOTTED light-DOM children, so a normal querySelector on the
// block resolves them. `heading` is a back-compat alias for `title`; the two
// CTAs are the first (primary/filled) and second (secondary/outline) buttons.
export const XE_HERO_FIELDS = {
  // Text fields (set textContent).
  title: 'h1[slot="title"]',
  heading: 'h1[slot="title"]',
  subtitle: 'p[slot="subtitle"]',
  primaryCta: 'div[slot="actions"] xe-button:nth-of-type(1)',
  secondaryCta: 'div[slot="actions"] xe-button:nth-of-type(2)',
  // Link fields (set the CTA href on the web component + its shadow <a>).
  primaryCtaLink: { selector: 'div[slot="actions"] xe-button:nth-of-type(1)', apply: setXeButtonHref },
  secondaryCtaLink: { selector: 'div[slot="actions"] xe-button:nth-of-type(2)', apply: setXeButtonHref },
  // Image field (swap the background image; the slotted media is a bare <img>).
  image: { selector: 'img[slot="media"]', apply: setPictureImage },
};

// Blocks that can be personalized inside an Intent Section, keyed by the name
// used in the offer's `blocks` entries → the block's selector within the
// section and its field map. `hero` is an author-friendly alias for `hero-v3`.
// The Intent Section filter (models/_intent-section.json) allows hero-v3 and
// xe-hero, so both are personalizable here.
export const INTENT_SECTION_BLOCKS = {
  'hero-v3': { selector: '.hero-v3', fields: HERO_V3_FIELDS },
  hero: { selector: '.hero-v3', fields: HERO_V3_FIELDS },
  'xe-hero': { selector: '.xe-hero', fields: XE_HERO_FIELDS },
};

// Shared heading selector used by several block field maps below and elsewhere.
export const HEADING = 'h1, h2, h3, h4, h5, h6';
