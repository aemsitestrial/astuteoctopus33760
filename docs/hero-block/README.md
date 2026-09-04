# Hero Block — AEM Edge Delivery Services + Universal Editor + Content Fragment Implementation

Source of truth: the attached "Hero" block specification (1 base configuration + 6 named
variants). This document treats that spreadsheet as authoritative. Where the spreadsheet is
missing, contradictory, or ambiguous, the gap is called out explicitly in Section 2 rather
than silently resolved.

---

## 1. Requirement Summary

| # | Requirement (verbatim intent) | Source |
|---|---|---|
| R1 | Full-width hero section with background image, title, optional sublabel (subtitle), optional actions | Block description |
| R2 | Fields: Title, Subtitle, Image (URL + DAM picker), Alt, Action Text, Action Link, Action Multifield (max 2, first primary / second static light) | All Fields table |
| R3 | Height select: Responsive (default) / Tall / Standard / Compact | All Fields table |
| R4 | Text Alignment select: Center (default) / Left | All Fields table |
| R5 | Image Position select: Center (default) / Top / Bottom | All Fields table |
| R6 | Variant: Tall Center with Action — Height=Tall(Y), Text Alignment=Center(Y), Image Position=Center(Y) | Variant table |
| R7 | Variant: Tall Left with Actions — Height=Tall(Y), Text Alignment=Left(Y), Image Position=Center(Y) | Variant table |
| R8 | Variant: Standard Center with Actions — Height=Standard(Y), Text Alignment=Center(Y), Image Position=n/a(N) | Variant table |
| R9 | Variant: Standard Left with Actions — Height=Standard(Y), Text Alignment=Left(Y), Image Position=n/a(N) | Variant table |
| R10 | Variant: Compact Center with Actions — Height=Compact(Y), Text Alignment=Center(Y), Image Position=n/a(N) | Variant table |
| R11 | Variant: Compact Left with Actions — Height=Compact(Y), Text Alignment=Left(Y), Image Position=n/a(N) | Variant table |
| R12 | No field in the spec is marked Required=Y on the base "All Fields" configuration | All Fields table |

Delivery constraints applied on top of R1–R12 (from the task instructions, not the block
spec): AEM EDS conventions, Universal Editor authoring, AEM Author + Content Fragments as the
content source, vanilla JS, mobile-first CSS, WCAG 2.2 AA, Core Web Vitals-conscious
implementation, no secrets/hardcoded environment values, defensive/safe DOM handling.

---

## 2. Assumptions and Gaps

The spec contains four material ambiguities. Each is resolved with the narrowest possible
interpretation and flagged here rather than silently designed around.

**A1 — "Required=Y" on preset variants, for fields whose value the variant name already fixes.**
Every named variant (e.g. "Tall Center with Action") marks Height, Text Alignment, and
(where applicable) Image Position as Required=Y, but the variant's *name* already states
those exact values. Two readings are possible: (a) the author still sees three required
selects, pre-filled with the matching value, or (b) the fields are removed from the authoring
dialog entirely and the value is injected by the variant/component definition. This
implementation takes reading (b): Universal Editor `component-definition.json` presets inject
`height` / `textAlignment` / `imagePosition`, and those fields are **not** present in the
corresponding `component-models.json` dialog (see Section 6). Rationale: presenting a
required select whose only legal value duplicates the component's own name would be a
redundant, confusing authoring surface and offers no content flexibility. If the actual
intent was reading (a) — visible, required, pre-filled selects the author could theoretically
still see but not usefully change — swap the affected variant field arrays in
`component-models.json` for the full-selects block used by the base `hero` definition; no
other file changes are required.

**A2 — "Image" appears twice with two different field types ("Image URL" and "Image URL DAM
Picker").** AEM Content Fragment Models do not support two backing field types for one
logical field. This is modeled as a single `content-reference` field resolved via the DAM
asset picker (satisfies "DAM Picker"), whose resolved path renders to a delivery URL at
render time (satisfies "Image URL"). No separate raw-URL text field was added, since the spec
does not describe two different pieces of content (e.g., "external URL" vs. "internal
asset") — it describes one image field with two candidate authoring mechanisms.

**A3 — Two competing shapes for calls to action: flat `Action Text` / `Action Link`, and a
separate `Action Multifield` (max 2, positional style default).** These cannot both be the
literal field set without producing duplicate, disconnected CTAs. The multifield is modeled
as canonical because it is the more complete definition (supports the documented 2-CTA,
positional-style requirement); the flat fields are treated as a legacy/alias description of
multifield item 0 and are not separately exposed in the dialog. `hero.js` still honors the
spec's positional default (first = primary, second = static-light) at render time regardless
of how the multifield was populated.

**A4 — Text-over-image contrast.** The spec does not mention a scrim/overlay, but "title"
and "actions" are specified to render over a full-bleed background image, and the delivery
task requires WCAG 2.2 AA. A dark gradient scrim (`.hero__media::after`,
`rgba(0,0,0,0.55)→rgba(0,0,0,0.65)`) was added purely to keep text/action contrast compliant
against arbitrary authored imagery; it introduces no new content or field and is disabled
under `forced-colors` mode. This is flagged as an addition, not a spec requirement. **Note:**
an initial draft used a weaker gradient (0.35→0.55); validation math (see Validation
Addendum) showed it dropped to 2.65:1 against a bright authored image at the point where
centered content actually sits, failing AA body-text contrast. The value above was solved to
clear 4.5:1 at every point in the gradient against a worst-case near-white image, with margin.

**A5 — Heading level for Title.** The spec does not state whether Title renders as `h1`–`h6`.
The implementation preserves whatever heading level the author/editor assigns in the rich
text row (EDS default behavior) rather than hard-coding `h1`, since a Hero block can appear
below an existing page `h1` in some templates. Recommendation, not enforced: use `h1` only
when Hero is the first heading on the page.

**A6 — "n/a" vs. "N" in the Required column for Image Position (Standard/Compact variants).**
Interpreted as: the field is not applicable to that variant (hidden), not merely optional. If
a future authoring need requires exposing Image Position on Standard/Compact variants, add it
back into the relevant `component-models.json` entries and remove the `null` preset in
`component-definition.json`.

---

## 3. Architecture and File Structure

### 3.1 Content flow

```
AEM Author (Content Fragment "hero" model)
        │  authored/edited in-context via Universal Editor
        ▼
Content Fragment instance (e.g. /content/dam/.../hero-main)
        │  referenced by an EDS page's Hero block instance
        ▼
EDS page (default block-table markup, rendered server-side from the CF
via the project's CF-to-block rendering pipeline / HTL script)
        │  <div class="hero ...">...</div> delivered as plain HTML
        ▼
Browser: /blocks/hero/hero.js decorate(block) + /blocks/hero/hero.css
        │  progressive enhancement only — the undecorated markup is
        │  already readable, linkable, and crawlable without JS
        ▼
Rendered Hero UI
```

Universal Editor edits the Content Fragment in place: `data-aue-*` instrumentation on the
rendered block markup points at the CF's `jcr:content/data/master` element paths (see Section
6.3), so authors edit the same fragment fields whether they open it from the CF console or
in-context on the page. This satisfies "Universal Editor" + "AEM Author as the content
source" + "Content Fragments" as one coherent pipeline rather than three separate content
stores.

### 3.2 File structure (EDS project conventions)

```
/blocks/hero/
  hero.js                     — block decoration logic (this deliverable)
  hero.css                    — block styles (this deliverable)
/models/
  hero.model.json             — Content Fragment Model (author-time)
/component-definition.json    — Universal Editor: 7 component ids (base + 6 variants)
/component-models.json        — Universal Editor: per-id authoring dialog fields
/component-filters.json        — Universal Editor: allowed nesting (none, for hero)
/tools/sample-content/
  hero-sample-fragment.json   — example CF instance
```

---

## 4. Content Fragment Model

See `hero.model.json` (delivered alongside this document). Field summary:

| Field | Type | Required | Default | Allowed values |
|---|---|---|---|---|
| title | single-line text | No | — | free text, max 120 chars |
| subtitle | single-line text | No | — | free text, max 220 chars |
| image | content-reference (asset) | No | — | image/jpeg, image/png, image/webp, image/avif |
| imageAlt | single-line text | No | — | free text, max 250 chars |
| actions | multifield (max 2) of {actionText, actionLink, actionStyle} | No | [] | actionStyle ∈ {primary, static-light}, positional default 0→primary,1→static-light |
| height | enum (single-select) | No (see A1) | responsive | responsive, tall, standard, compact |
| textAlignment | enum (single-select) | No (see A1) | center | center, left |
| imagePosition | enum (single-select) | No (see A1) | center | center, top, bottom |

Full field definitions, validation, and per-field notes are in `hero.model.json`.

---

## 5. Sample Content Fragment Asset

See `hero-sample-fragment.json`. It models the **standard-center-with-actions** variant with
safe, non-sensitive sample values (no PII, no secrets, no external tracking parameters).

---

## 6. Universal Editor Configuration

### 6.1 Component definitions
`component-definition.json` registers 7 component ids under a single "Hero" group: `hero`
(base, all fields author-editable) and the six locked-preset variants named
`hero-<height>-<alignment>-with-action(s)`, matching the spec's variant names. Each preset
variant carries a `presets` object (`height`, `textAlignment`, `imagePosition`) that is
applied at render/authoring time and is **not** exposed as an editable field — see A1.

### 6.2 Component models (author dialogs)
`component-models.json` defines the field set shown to authors per component id:
- `hero`: full field set, including Height / Text Alignment / Image Position selects.
- All six variant ids: same content fields (title, subtitle, image, imageAlt, actions) minus
  the locked layout selects.

### 6.3 Instrumentation for in-context editing
The rendered block root and each editable region carry Universal Editor attributes mapping to
the underlying Content Fragment element paths, e.g.:

```html
<div class="hero standard-center-with-actions"
     data-aue-resource="urn:aemconnection:/content/dam/wknd/fragments/homepage/hero-main/jcr:content/data/master"
     data-aue-type="component"
     data-aue-model="hero-standard-center-with-actions"
     data-aue-filter="hero-standard-center-with-actions">
  <div data-aue-prop="title" data-aue-type="text" data-aue-label="Title">…</div>
  <div data-aue-prop="subtitle" data-aue-type="richtext" data-aue-label="Subtitle">…</div>
  <div data-aue-prop="image" data-aue-type="media" data-aue-label="Image">…</div>
  <div data-aue-prop="actions" data-aue-type="container" data-aue-label="Actions">…</div>
</div>
```

`hero.js` does not depend on these attributes at runtime (they are author-tooling only) and
strips none of them, so Universal Editor's overlay continues to resolve click targets after
`decorate()` rebuilds the DOM, because attributes carried on `mediaRow`/`contentRow`'s
descendant elements are preserved (elements are moved, not cloned, into the new structure)
where the same element instance is reused (`heading`, `subtitleParagraph`); only wrapper
`<div>`s introduced by decoration are new and carry no `data-aue-*` (expected: they are
layout containers, not editable regions).

---

## 7. Block JavaScript

See `hero.js`. Key properties:
- Single default export `decorate(block)`, standard EDS block contract.
- No global state; all helpers are module-scoped pure functions.
- Defensive against missing image, missing heading, missing/invalid links, missing/invalid
  action style, and unknown variant classes (falls back to spec defaults).
- URL allow-list (`isSafeUrl`) blocks `javascript:`, `data:`, `vbscript:`, and
  protocol-relative URLs before anything is written to `href`.
- No `innerHTML`/`outerHTML` assignment of authored strings; all text goes through
  `textContent`, and only vetted `href`/`alt`/`class` attribute values are set.
- Uses the project's existing `createOptimizedPicture` helper (already vetted, already in
  every EDS project) rather than re-implementing responsive image logic.

---

## 8. Block CSS

See `hero.css`. Key properties:
- Mobile-first: base rules target the smallest viewport; `min-width` media queries only add
  spacing, never restructure layout.
- All sizing driven by block-scoped custom properties (`--hero-*`), no reliance on global
  variables.
- `clamp()` for fluid type/height instead of a matrix of fixed breakpoints.
- `prefers-reduced-motion` removes the only transition in the block (button hover/focus).
- `forced-colors` block preserves button visibility and disables the decorative scrim.
- `:focus-visible` outline meets the 3:1 non-text contrast requirement independent of theme.
- No layout-shifting behavior: image container is absolutely positioned within a block that
  already has an explicit `min-height` per height variant, so the box exists before the image
  loads.

---

## 9. Variant Mapping

| Spec variant name | Component id | height | textAlignment | imagePosition | CSS classes added by JS |
|---|---|---|---|---|---|
| (base) Hero — All Fields | `hero` | author choice, default `responsive` | author choice, default `center` | author choice, default `center` | `hero--height-<v>`, `hero--align-<v>`, `hero--image-position-<v>` |
| Tall Center with Action | `hero-tall-center-with-action` | `tall` (locked) | `center` (locked) | `center` (locked) | `hero--height-tall hero--align-center hero--image-position-center` |
| Tall Left with Actions | `hero-tall-left-with-actions` | `tall` (locked) | `left` (locked) | `center` (locked) | `hero--height-tall hero--align-left hero--image-position-center` |
| Standard Center with Actions | `hero-standard-center-with-actions` | `standard` (locked) | `center` (locked) | n/a (hidden) | `hero--height-standard hero--align-center` |
| Standard Left with Actions | `hero-standard-left-with-actions` | `standard` (locked) | `left` (locked) | n/a (hidden) | `hero--height-standard hero--align-left` |
| Compact Center with Actions | `hero-compact-center-with-actions` | `compact` (locked) | `center` (locked) | n/a (hidden) | `hero--height-compact hero--align-center` |
| Compact Left with Actions | `hero-compact-left-with-actions` | `compact` (locked) | `left` (locked) | n/a (hidden) | `hero--height-compact hero--align-left` |

`VARIANT_PRESETS` in `hero.js` and the `presets` blocks in `component-definition.json` are the
single source of truth for this table; the markdown table above is generated from them and
must be kept in sync if either changes.

---

## 10. Adobe Target Integration Guide

### 10.1 Stable selectors
Target activities should key off attributes that survive re-authoring and re-ordering:
- Block root: `.hero[data-block-name="hero"]` (set explicitly by `hero.js`, independent of
  variant class, so one Target rule matches every Hero instance).
- Per-region hooks (add if a specific activity needs them, do not rely on nth-child):
  `.hero__title`, `.hero__subtitle`, `.hero__actions`, `.hero__action--primary`,
  `.hero__action--static-light`.
- Avoid selecting on generated utility classes like `hero--height-tall` for *audience*
  targeting (they describe layout, not identity); they are fine for *variant-aware* offer
  logic (e.g., "only show this campaign on Compact heroes because there's less vertical
  room").

### 10.2 Variant targeting
Because layout variant is exposed as `data-height`, `data-text-alignment`, and (where
applicable) `data-image-position` on the block root, a single Target activity can branch
content per variant without separate activities per component id:
```js
const hero = document.querySelector('.hero[data-block-name="hero"]');
const heightVariant = hero?.dataset.height; // 'responsive' | 'tall' | 'standard' | 'compact'
```

### 10.3 Content replacement pattern (form-based / visual composer)
1. Target the container, not individual text nodes: replace the full contents of
   `.hero__content` (or a specific child) rather than doing string replacement inside an
   existing text node, to avoid partially-applied edits if the experiment fails to load.
2. Never inject via `innerHTML` with unsanitized experiment payloads authored outside AEM;
   Target experiences should set `textContent` for copy and `href`/`src` through the same
   allow-list logic used in `hero.js` (duplicate `isSafeUrl` in the Target mbox script, or
   route Target-driven CTAs through a shared utility module if the project already ships one).
3. Preserve the existing DOM node count where possible (swap text/attributes rather than
   removing/re-adding elements) to avoid retriggering CLS.

### 10.4 Flicker prevention and layout stability
- Use Target's `mbox` in **synchronous global mbox / at.js pre-hiding snippet** at the point
  where the Hero block's container exists, scoped to `.hero` only (not `body`), so the rest of
  the page renders immediately.
- Cap the pre-hiding timeout low (≤ 300–500 ms) — the Hero block's box already has a
  `min-height` per height variant before Target runs, so even a timeout fallback does not
  shift layout; it only shows the AEM-authored default content.
- Do not let a Target experience change `height`/`min-height` custom properties; that is the
  one style path guaranteed to cause CLS given how the block reserves space.

### 10.5 Accessibility under Target
- If Target swaps the title/subtitle text, it must not remove the heading element itself
  (screen reader users navigating by heading list would lose the landmark).
- If Target swaps a CTA, keep `aria-label`/visible text in sync (don't leave a visually
  changed button with a stale accessible name from a prior test cell).
- Re-run the focus-visible check after any Target-driven markup change; Target should never
  strip the `hero__action` class that carries the focus outline.

### 10.6 SEO
- Prefer server-side (Target/AEM as Cloud Service edge) experiences over client-side DOM
  rewrites for anything that should be indexed with the winning variant's copy, since a purely
  client-side swap can leave crawlers seeing the pre-test control copy.
- Never use Target to alter the `href` of the primary CTA to a URL blocked by `robots.txt` or
  to inject `rel="nofollow"` unintentionally when not authored that way originally.

### 10.7 Responsiveness and validation
- QA every activity at the same breakpoints as the base CSS (mobile-first: verify at the
  smallest supported width first).
- Validate that `isSafeUrl`-equivalent checks run in the Target activity itself, not only in
  `hero.js` — Target-authored links bypass `hero.js` entirely once the DOM is already built.

---

## 11. Test Scenarios

| ID | Scenario | Expected result |
|---|---|---|
| T1 | Base Hero authored with only Title | Renders title, no subtitle, no actions, no broken layout; height defaults to responsive |
| T2 | Base Hero, no Image authored | No `<picture>` rendered; block keeps its min-height (no collapse); neutral background color visible, no CLS |
| T3 | Base Hero, Image with empty Alt | `alt=""` rendered (decorative); no console error thrown |
| T4 | Actions authored with 1 item | Single `.hero__action--primary` rendered; `.hero__actions` still renders (not required to have 2) |
| T5 | Actions authored with 2 items, no explicit style | First → `--primary`, second → `--static-light` (positional default) |
| T6 | Action link = `javascript:alert(1)` | Anchor is dropped entirely by `isSafeUrl`; no `href` written |
| T7 | Action link = `//evil.example.com` | Anchor dropped (protocol-relative blocked) |
| T8 | Tall Center with Action variant instantiated | `hero--height-tall hero--align-center hero--image-position-center` all present regardless of any stray data attributes |
| T9 | Standard Center with Actions variant | No `hero--image-position-*` class present; no Image Position control shown in Universal Editor dialog |
| T10 | Keyboard-only pass | Tab reaches both actions in DOM order; visible focus ring on each; no keyboard trap |
| T11 | Screen reader pass (heading list) | Hero title is announced as a heading at the authored level; no duplicate/empty heading nodes |
| T12 | `prefers-reduced-motion: reduce` | No transition observed on action hover/focus |
| T13 | `forced-colors: active` (Windows High Contrast) | Actions remain visible with system-color borders; scrim removed |
| T14 | Zoom to 200% / text resize to 200% | No text clipping, no horizontal scroll introduced by the block itself |
| T15 | Universal Editor in-context edit of Title | Edits persist to the underlying Content Fragment `title` element, confirmed via CF console |
| T16 | Lighthouse run on a page with only a Tall Hero above the fold | Hero image is the LCP candidate and loads with `fetchpriority="high"`; CLS contribution from the block ≈ 0 |

---

## 12. Accessibility, Security, SEO, and Performance Checklists

### 12.1 Accessibility (WCAG 2.2 AA target)
- [ ] Text/background contrast ≥ 4.5:1 for body copy, ≥ 3:1 for large title text, verified
      against the scrim over representative authored images (spot-check bright images).
- [ ] Focus indicator ≥ 3:1 contrast and not obscured (`:focus-visible`, 2px offset).
- [ ] Touch targets ≥ 24×24 CSS px (implemented at 44px min-height for actions, WCAG 2.2 AA
      "Target Size (Minimum)").
- [ ] Heading structure: Hero title uses a real heading element, not a styled `<div>`.
- [ ] Images: authored Alt is honored; missing Alt renders `alt=""` deliberately.
- [ ] No motion-based-only affordance; no auto-playing media in this block.
- [ ] Reflow at 320px CSS width and 400% zoom without loss of content/function.
- [ ] `forced-colors` mode validated in a Chromium/Edge high-contrast test pass.

### 12.2 Security
- [ ] All authored/user-influenced strings rendered via `textContent`, never `innerHTML`.
- [ ] `href` values pass an explicit allow-list (`isSafeUrl`) before being written to the DOM.
- [ ] `target="_blank"` always paired with `rel="noopener noreferrer"`.
- [ ] No secrets, tokens, or environment-specific endpoints in block code or CF sample data.
- [ ] Content Fragment model fields have explicit `maxLength`/`allowedValues` to reduce stored
      payload abuse surface.
- [ ] Target-driven content replacement (Section 10.3) documented as requiring the same
      URL/text sanitization discipline as the block itself.

**Residual risks (not eliminated by this implementation):**
- If a future author-facing rich-text field is added to `subtitle` (currently plain text),
  any HTML sanitization for that richtext must be re-verified; this implementation assumes
  `subtitle` stays plain text as modeled.
- `isSafeUrl` allows any `https:`/relative URL; it does not verify the destination is not a
  malicious but syntactically valid site (out of scope for a client-side block — belongs to
  editorial review / CF workflow).
- Universal Editor instrumentation (`data-aue-*`) is author-tooling metadata; it must not be
  relied upon as a security boundary and should be confirmed stripped or inert in the public
  delivery pipeline if the project's build does not already do so.

### 12.3 SEO
- [ ] Title renders as real, crawlable text (not an image, not CSS `content`).
- [ ] Heading level is deliberate per page (see A5); avoid multiple `h1`s per page.
- [ ] Hero image has meaningful `alt` when non-decorative (author responsibility; block
      enforces nothing beyond falling back gracefully when it's empty).
- [ ] No SEO-relevant content is injected only via client-side JS beyond what `decorate()`
      does with content already present in the initial server-rendered HTML (progressive
      enhancement, not content creation).

### 12.4 Performance / Core Web Vitals
- [ ] Hero image marked `fetchpriority="high"` + `loading="eager"` (likely LCP element).
- [ ] `createOptimizedPicture` reuses the project's existing responsive image pipeline (no
      duplicate image-processing logic/network calls).
- [ ] Reserved box height (`min-height` per variant) prevents CLS from image load.
- [ ] No blocking synchronous network calls in `decorate()`; block only rearranges DOM already
      delivered with the page.
- [ ] CSS is block-scoped and loaded only when the block is present (standard EDS block CSS
      loading), no unused global CSS shipped for pages without a Hero.

**Recommended validation tooling** (not run as part of this deliverable): ESLint with a
security-focused ruleset (e.g. `eslint-plugin-no-unsanitized`) for static analysis; axe-core
or Lighthouse accessibility audit; OWASP ZAP or equivalent for link/redirect handling if Hero
CTAs are exposed to any dynamic/query-string-driven authoring path in the future; Lighthouse
CI and WebPageTest for Core Web Vitals regression tracking.

---

## 13. Requirement Traceability Matrix

| Req | CF Model field | Authored value example | Markup | JS | CSS | Accessibility | Test case |
|---|---|---|---|---|---|---|---|
| R1 (full-width hero, bg image, title, sublabel, actions) | title, subtitle, image, actions | `hero-sample-fragment.json` | `.hero > .hero__media, .hero__content` | `decorate()` assembly | `.hero`, `.hero__media`, `.hero__content` | Heading + alt handling | T1, T2, T11 |
| R2 (Image URL + DAM picker) | `image` (content-reference) | `/content/dam/.../hero-mountain-trail.jpg` | `<picture><img></picture>` | `createOptimizedPicture` call | `.hero__media img { object-fit: cover }` | Alt fallback | T2, T3 |
| R2 (Alt) | `imageAlt` | "Hikers crossing a wooden bridge…" | `img[alt]` | `alt` set from `img.getAttribute('alt')` | n/a | Decorative fallback `alt=""` | T3 |
| R2 (Action Text/Link/Multifield, max 2, positional style) | `actions[]` | 2-item array in sample fragment | `.hero__actions > a.hero__action` | `buildAction()`, `isSafeUrl()` | `.hero__action--primary/--static-light` | 44px touch target, focus ring | T4, T5, T6, T7, T10 |
| R3 (Height select, default Responsive) | `height` | `standard` | `.hero--height-*` class | `resolveLayoutConfig()` | `--hero-min-height-*` vars | Reflow at 400% zoom | T14 |
| R4 (Text Alignment, default Center) | `textAlignment` | `center` | `.hero--align-*` class | `resolveLayoutConfig()` | `.hero__content` flex rules | n/a | T1 |
| R5 (Image Position, default Center) | `imagePosition` | `center` | `.hero--image-position-*` class | `object-position` set on `img` | n/a | n/a | T8 |
| R6 (Tall Center with Action) | preset, not authored | n/a (locked) | class list per Section 9 | `VARIANT_PRESETS['tall-center-with-action']` | height/align/image-position rules combined | n/a | T8 |
| R7 (Tall Left with Actions) | preset | n/a (locked) | class list per Section 9 | `VARIANT_PRESETS['tall-left-with-actions']` | `.hero--align-left` | n/a | T8 (analogous) |
| R8 (Standard Center with Actions) | preset | n/a (locked) | class list per Section 9, no image-position class | `VARIANT_PRESETS['standard-center-with-actions']` (imagePosition: null) | no `--image-position-*` applied | n/a | T9 |
| R9 (Standard Left with Actions) | preset | n/a (locked) | class list per Section 9 | preset entry | `.hero--align-left` | n/a | T9 (analogous) |
| R10 (Compact Center with Actions) | preset | n/a (locked) | class list per Section 9 | preset entry | `--hero-min-height-compact` | n/a | T9 (analogous) |
| R11 (Compact Left with Actions) | preset | n/a (locked) | class list per Section 9 | preset entry | `.hero--align-left` | n/a | T9 (analogous) |
| R12 (nothing required on base) | all fields, `required: false` | any subset | any partial markup | every DOM read in `decorate()` is null-checked | block never assumes any child exists | Graceful empty states | T1, T2 |

---

## 14. Final Compliance Report

- **Spec fidelity:** All 12 extracted requirements (R1–R12) are implemented without added
  fields, removed fields, or reinterpreted defaults, except where Section 2 documents an
  explicit, narrow interpretation of a genuine spec ambiguity (A1–A3, A6). No requirement was
  silently dropped.
- **Additions beyond the literal spec:** one visual scrim for text contrast (A4) and a
  heading-level policy note (A5); both documented, neither adds or changes authorable content.
- **Variant coverage:** 7 of 7 configurations implemented (1 base + 6 named variants),
  each with its own Universal Editor component id, dialog, and locked-preset behavior.
- **Standards targeted, not guaranteed:** WCAG 2.2 AA, Core Web Vitals-conscious markup, and
  the security checklist in Section 12.2 describe the target and the mitigations actually
  implemented. This deliverable does **not** claim to be vulnerability-free or to have passed
  a completed accessibility audit — Section 12 lists the specific static analysis,
  accessibility, and performance tools recommended to validate that before production release.
- **Outstanding decisions for the requesting team:** confirm interpretation A1 (hidden vs.
  visible-but-locked selects on variants) and A3 (multifield-as-canonical vs. flat fields)
  before this ships, since both are genuine content-model decisions the source spreadsheet
  did not disambiguate.

---

## Validation Addendum

The implementation was re-checked programmatically against the spec after initial delivery,
rather than re-asserted from memory. Checks performed and results:

| Check | Method | Result |
|---|---|---|
| All JSON deliverables are syntactically valid | `json.load()` on all 5 JSON files | Pass |
| `hero.js` is syntactically valid | `node --check` | Pass |
| `hero.css` braces are balanced | brace count | Pass |
| Base "Hero" field defaults/allowed values match spec (`height`, `textAlignment`, `imagePosition`) | scripted diff of `hero.model.json` against transcribed spec values | Pass |
| Every CFM field is `required: false` (locking done in the UE layer per A1, not the model) | scripted check | Pass |
| Actions multifield capped at 2 items | scripted check of `maxItems` | Pass |
| Positional action-style default (first=primary, second=static-light) | scripted check of `defaultByPosition` | Pass |
| All 6 variant presets (`height`/`textAlignment`/`imagePosition`) match the spec's per-variant defaults exactly | scripted diff of `component-definition.json` presets against transcribed spec table | Pass |
| Layout selects (`height`/`textAlignment`/`imagePosition`) present only on the base `hero` dialog, absent from all 6 variant dialogs | scripted check of `component-models.json` | Pass |
| `hero.js` `VARIANT_PRESETS` values match `component-definition.json` presets 1:1 (no drift between the two files) | scripted diff | Pass |
| Spec's own singular/plural inconsistency ("...with Action" vs. "...with Actions") preserved in component ids | scripted check | Pass |
| CSS classes emitted by `hero.js` (`hero--height-*`, `hero--align-*`, `hero--image-position-*`) are backed by actual CSS rules | regex diff of JS template strings vs. CSS selectors | **Initially failed** — `hero--image-position-*` classes were added to the DOM but had no CSS rule; positioning was instead done via a JS-set inline style. **Fixed:** removed the inline style, added `.hero--image-position-{center,top,bottom} .hero__media img { object-position: ... }` rules so the documented class-based architecture (Section 9) matches the actual code. |
| Text/action contrast over the scrim meets WCAG 2.2 AA (4.5:1 body text) against a worst-case bright authored image, at every point in the gradient (not just its darkest stop) | relative-luminance/contrast-ratio calculation (WCAG formula) at gradient 0%, 50%, 100%, against image grays 200/245/255 | **Initially failed** — the original 0.35→0.55 alpha gradient produced only 2.65:1 at its lightest stop, which is where vertically-centered content actually sits. **Fixed:** raised the gradient to 0.55→0.65 alpha; re-verified ≥4.5:1 at every stop against every tested image brightness, including pure white (255,255,255). |

Both defects were in implementation details layered on top of the spec (Assumption A4's scrim,
and the CSS/JS wiring for Image Position), not in the transcription of the spec's own field
names, defaults, or required flags — those all matched on first pass. Corrected files are the
ones delivered; no further known discrepancies as of this validation pass.
