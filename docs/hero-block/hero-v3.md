# Hero V3 — clean inline hero block

A self-contained AEM Edge Delivery Services hero: a full-bleed background image, title, optional
subtitle, up to two positional CTAs, and six locked layout variants. Unlike **Hero V2**, Hero V3
has **no Content Fragment / GraphQL dependency** — all content is authored directly in the block.

- Block code: `blocks/hero-v3/hero-v3.js`, `blocks/hero-v3/hero-v3.css`
- Model: `blocks/hero-v3/_hero-v3.json`
- Sample draft: `docs/hero-block/hero-v3-demo.html` (renders all 7 variants with the real block)

## When to use which hero

| Block | Content source | Use when |
|---|---|---|
| `hero` | inline (legacy green-gradient) | existing pages already using it |
| `hero-v2` | inline **or** Content Fragment (persisted GraphQL) | you want CF-driven / personalized heroes |
| `hero-v3` | inline only | you want a clean, dependency-free hero authored on the page |

## Authoring fields (`_hero-v3.json`)

| Field | Component | Notes |
|---|---|---|
| `image` | reference | Background image (full-bleed). Optional — a neutral background shows if absent. |
| `imageAlt` | text | Alt text; empty renders `alt=""` (decorative). |
| `title` | richtext | Headline → heading element (`.hero-title`). |
| `subtitle` | richtext | Supporting copy (`.hero-subtitle`). |
| `cta_primaryLink` / `cta_primaryLinkText` | aem-content / text | First CTA → `.hero-action-primary`. |
| `cta_secondaryLink` / `cta_secondaryLinkText` | aem-content / text | Second CTA → `.hero-action-static-light`. |
| `classes` | select | Variant (locks height / alignment / image position). |

## Variants

Selecting a **Variant** adds a class the block reads to lock layout; the base variant is
author-controlled.

| Variant class | Height | Align | Image position | Actions |
|---|---|---|---|---|
| _(base)_ | responsive | center | center | author choice |
| `tall-center-with-action` | tall | center | center | 1 (primary) |
| `tall-left-with-actions` | tall | left | center | 2 |
| `standard-center-with-actions` | standard | center | hidden | 2 |
| `standard-left-with-actions` | standard | left | hidden | 2 |
| `compact-center-with-actions` | compact | center | hidden | 2 |
| `compact-left-with-actions` | compact | left | hidden | 2 |

## Rendered structure (post-decoration)

`decorate()` rebuilds the block into stable, class-based anchors (used by both CSS and Adobe
Target):

```html
<div class="hero-v3 hero-height-standard hero-align-center hero-image-position-center"
     data-block-name="hero-v3"
     data-height="standard" data-text-alignment="center" data-image-position="center">
  <div class="hero-media"><picture>…<img loading="eager" fetchpriority="high"></picture></div>
  <div class="hero-content">
    <h2 class="hero-title">…</h2>
    <p class="hero-subtitle">…</p>
    <div class="hero-actions">
      <a class="hero-action hero-action-primary" href="…">…</a>
      <a class="hero-action hero-action-static-light" href="…">…</a>
    </div>
  </div>
</div>
```

## Accessibility, security, performance

- **A11y:** real heading element, 44px min touch targets, `:focus-visible` outline, WCAG-AA
  contrast scrim over the image, `forced-colors` and `prefers-reduced-motion` support.
- **Security:** authored text set via `textContent` (never `innerHTML`); CTA `href` values pass
  an `isSafeUrl` allow-list that blocks `javascript:`/`data:`/`vbscript:`/protocol-relative URLs.
- **Performance:** hero image is eager + `fetchpriority="high"` (likely LCP); `min-height` per
  variant reserves space to avoid CLS.

## Adobe Target integration

Hero V3 is wired into the project's form-based Target integration (`scripts/target.js`) under the
scope **`hero-v3`**. See `docs/hero-block/hero-v3-target-offer.md` for the JSON offer contract and
`docs/adobe-target-form-based.md` for the general model.
