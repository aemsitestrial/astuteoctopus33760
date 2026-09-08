# Adobe Target on EDS — Form-Based Experiences (JSON offers)

This guide explains how to convert a Target activity from **Visual Experience
Composer (VEC)** targeting to **Form-Based Experience Composer** targeting, and
how the code in `scripts/target.js` applies those experiences.

## Why form-based for Edge Delivery Services

VEC produces `dom-action` offers — "replace the HTML of *this CSS selector*". On
EDS this is fragile: the selectors are captured against one DOM snapshot, but EDS
decoration injects wrapper elements (`div.section` → `div.<block>-wrapper` →
`div.<block>.block`) at runtime. A positional selector such as

```
HTML > BODY > MAIN > DIV:nth-of-type(1) > DIV.metrics:eq(0) > DIV:nth-of-type(2) > DIV:nth-of-type(2)
```

no longer resolves after decoration, so `querySelector` returns `null` and the
experience silently does nothing. This is exactly why, in a multi-block activity,
only the experience anchored to a stable element **id** (the hero `<h1>`) applied
while the `.metrics` and `.feature-cards` experiences did not.

**Form-Based** offers carry **no selector**. Target returns a JSON blob for a named
**decision scope**, and *our code* decides where it goes — anchored to stable
elements (ids, block classes, label text). Nothing structural to break.

## Part 1 — Rebuild the activity in Adobe Target

1. **Create the JSON offers** (Offers → Create → JSON Offer), one per experience.
   Shape the `set` fields to match the handler for that scope (see the field
   table in Part 3):

   - Hero (`hero` scope):
     ```json
     { "set": { "heading": "Energy that works as hard as you do - Testing EXP A" } }
     ```
   - Feature-cards heading (`feature-cards` scope):
     ```json
     { "set": { "heading": "Energy made simple, honest, and green - Text Experience A" } }
     ```
   - Metrics label (`metrics` scope) — `match.item` locates the metric by its
     current label, `set` carries the new field values:
     ```json
     { "items": [ { "match": { "item": "Renewable mix today" }, "set": { "label": "Renewable mix today - Test experience A" } } ] }
     ```

   > For pages with several instances of the same block, use the `items` array with
   > a per-instance `match`. See *Multiple instances of the same block* below.

2. **Create the activity** (A/B or Experience Targeting) and choose the
   **Form-Based Experience Composer** (not Visual).

3. **Add a location (mbox / decision scope) per experience.** Name each scope to
   match a handler key in `FORM_BASED_HANDLERS` (`scripts/target.js`), e.g.
   `hero`, `metrics`, `feature-cards`.

4. **Assign the JSON offer** to each experience for its scope.

5. Set audiences/goals as usual and **activate**.

> One activity can serve multiple scopes, or you can use one activity per scope —
> the code requests all scopes in `FORM_BASED_SCOPES` in a single `sendEvent`.

## Part 2 — Datastream / request

`getAndApplyRenderDecisions()` already requests the scopes:

```js
await window.alloy('sendEvent', {
  renderDecisions: false,
  personalization: { decisionScopes: FORM_BASED_SCOPES },
});
```

No datastream change is required beyond having Adobe Target enabled on the
datastream (it already is — VEC offers are being delivered).

## Part 3 — Code (`scripts/target.js`)

The whole integration lives in its own module, **`scripts/target.js`**.
`scripts.js` only imports the readiness promise:

```js
import { alloyLoadedPromise } from './target.js';
// ... awaited in loadEager before first paint
```

Three things drive the form-based side:

- **`FORM_BASED_HANDLERS`** — one entry per scope (keyed by block name). Each reads
  the JSON offer and writes it to **stable anchors**, and returns `true` once fully
  applied so it runs only once as blocks decorate.
- **`FORM_BASED_SCOPES`** — derived automatically from the handler keys
  (`Object.keys(FORM_BASED_HANDLERS)`), so adding a handler also requests its scope.
- **Shared helpers** — `getBlocks`, `pickBlock`, `findItem`, `applyFields`,
  `applyInstructions`, plus two factories that remove per-block boilerplate:
  - **`blockHandler(blockClass, fieldMap)`** — for block-level fields (one heading,
    subtitle, CTA…). `fieldMap` maps offer field names → a selector (or function)
    within the picked block.
  - **`itemHandler(blockClass, itemSelector, labelSelector, fieldMap)`** — for
    repeated items (a metric, team member, plan…). `match.item` picks the item by
    its label text; `fieldMap` maps fields → selectors within that item.

```js
const FORM_BASED_HANDLERS = {
  // block-level fields
  hero: blockHandler('hero', {
    badge: '.hero-badge',
    heading: '.hero-heading h1, .hero-heading h2, .hero-heading h3',
    subtitle: '.hero-subtitle',
    primaryCta: '.hero-actions a.hero-btn-primary',
  }),
  // repeated items, matched by label text
  metrics: itemHandler('metrics', '.metrics-item', '.metrics-label', {
    value: '.metrics-value', label: '.metrics-label', change: '.metrics-change',
  }),
};
```

### Supported blocks and offer fields

All content blocks ship with a handler. Author your JSON offer's `set` object using
these field names:

| Scope (block) | Type | `set` fields | Item match key (`match.item`) |
|---|---|---|---|
| `hero` | block | `badge`, `heading`, `subtitle`, `primaryCta`, `secondaryCta` | — |
| `hero-v3` | block | `heading`, `subtitle`, `primaryCta`, `secondaryCta` | — |
| `feature-cards` | block | `label`, `heading`, `subtitle` | — |
| `usage-dashboard` | block | `heading`, `label`, `cta` | — |
| `cta-band` | block | `heading`, `subtitle`, `cta` | — |
| `page-header` | block | `label`, `heading`, `subtitle` | — |
| `about-hero` | block | `label`, `heading` | — |
| `area-finder` | block | `heading` | — |
| `contact-methods` | block | `heading` | — |
| `contact-form` | block | `heading` | — |
| `outage-banner` | block | `message` | — |
| `columns` | block | `heading` | — |
| `metrics` | item | `value`, `label`, `change` | current label text |
| `stats` | item | `value`, `label` | current label text |
| `team` | item | `name`, `role` | member name |
| `timeline` | item | `year`, `heading`, `description` | year |
| `values` | item | `heading`, `description` | title |
| `pricing-plans` | item | `name`, `price`, `cta` | plan name |
| `cards` | item | `heading`, `body` | card heading |
| `job-listings` | item | `title`, `description` | job title |
| `default-content` | text | `text` | `match.text` (current text) + optional `match.wrapper` index |
| `intent-section` | section | `text` | `match.section` (section `id` / `data-id`) + `match.text` (current child text) |
| `page` | composite | `blocks` (map of block → offer) | — |

### Default content (not in a block)

"Default content" is loose paragraphs, headings and lists authored straight into a
section — EDS wraps them in `.default-content-wrapper`. They have no block class,
labels or ids, so the `default-content` scope matches by the element's **current
text** (scoped to `<main>`, so header/footer are never touched):

```json
{
  "items": [
    { "match": { "text": "This is a sample text block" },
      "set":   { "text": "Personalized intro — Experience A" } },
    { "match": { "text": "Second text block example" },
      "set":   { "text": "Second block — Variant B" } }
  ]
}
```

- `match.text` (required) — exact trimmed text of the `p`/`h1..6`/`li` to replace.
- `match.wrapper` (optional) — zero-based index of the default-content wrapper in
  `<main>` to restrict the search, for when the same text appears more than once.
- `set.text` — the replacement text.

> Because the anchor *is* the current text, an offer breaks if the source copy is
> edited. For frequently-changed copy, prefer promoting it into a block with a
> stable class, or add a heading (which gets an auto-generated id).

### Intent Section (section-scoped text)

The **Intent Section** (`models/_intent-section.json`) is a section container that only allows
`text` and `hero-v3`, and exposes an authored **`id`** field. That field is rendered both as a
real DOM `id` attribute on the section (a normalized token, e.g. `hero-intent`, usable as a CSS
hook and `#anchor` target) and preserved as `data-id`. The `intent-section` scope personalizes
text *within a specific section*, matched by either form of that id — so the same activity can
target one section without touching identical copy elsewhere.

```json
{
  "items": [
    { "match": { "section": "hero-intent", "text": "Coffee title" },
      "set":   { "text": "Tea title — Experience A" } },
    { "match": { "section": "hero-intent", "text": "Drink a delicious coffee in the morning" },
      "set":   { "text": "Start your day with tea — Experience A" } }
  ]
}
```

- `match.section` (required) — the section id; matches the section's real `id` attribute
  (normalized) or its raw `data-id`.
- `match.text` (required) — exact trimmed text of the child `h1..6`/`p`/`li` to replace.
- `set.text` — the replacement text.

Scoped to `<main>` and to the matched section, so header/footer and other sections are never
touched. As with default content, the anchor *is* the current text, so an offer breaks if the
source copy is edited.

### Composite offers — several blocks in one scope

The `page` scope drives **multiple blocks from a single JSON offer**. Its content is
a `blocks` map keyed by block/scope name; each value is that block's normal offer
shape, dispatched to its own handler (so nothing is duplicated). Use it when a
personalized experience spans several blocks and you want one offer/one activity
instead of many:

```json
{
  "blocks": {
    "hero": {
      "set": { "heading": "Welcome back — Experience A", "subtitle": "Picked up where you left off." }
    },
    "metrics": {
      "items": [
        { "match": { "item": "Renewable mix today" }, "set": { "value": "91%", "change": "↑ 19% vs avg" } }
      ]
    },
    "feature-cards": {
      "set": { "heading": "Why switch to Xcel — Experience A" }
    }
  }
}
```

Notes:
- Each entry uses the **same shape** it would as a standalone offer (`set`,
  `items`/`match`/`set`, multi-instance `key`, etc.).
- Composite scopes cannot nest — a `page` offer may not contain another composite
  scope (guarded by `COMPOSITE_SCOPES`).
- Applies once when **all** listed blocks succeed; retries as blocks decorate.

### Adding a new form-based experience

1. Add an entry to `FORM_BASED_HANDLERS` (the scope is requested automatically).
   Use `blockHandler` or `itemHandler` so multi-instance support comes for free.
2. Anchor to something stable:
   - **Best:** a `data-target-key` on the block (authorable in UE — see below), or
     an element `id` (EDS auto-generates heading ids), e.g. `#some-heading`.
   - **Good:** a block class + content match (as `metrics` does by label text).
   - **Avoid:** `:nth-child` / `:nth-of-type` positional paths.
3. Shape the Target JSON offer's `set` to match the field names in the `fieldMap`.

## Multiple instances of the same block on one page

A decision scope maps to a *block type*, not a DOM element — so when a page has
several instances of the same block (three `metrics`, two heroes), a flat offer is
ambiguous. Use an **`items` array**, where each entry has a `match` (which
instance) and a `set` (what to change):

```json
{
  "items": [
    { "match": { "key": "hero-top" },    "set": { "heading": "Welcome back - Exp A" } },
    { "match": { "key": "hero-bottom" }, "set": { "heading": "Ready to switch? - Exp A" } }
  ]
}
```

`match` supports these strategies, best-first. `key`/`instance` pick the *block*;
`item` picks a repeated item *within* an item-collection block (metrics, team…).

| `match` | Selects | When to use |
|---|---|---|
| `{ "key": "hero-top" }` | block whose `data-target-key` = `hero-top` | **preferred** — position-independent, authorable in UE |
| `{ "item": "Renewable mix today" }` | repeated item found by its label text | item-collection blocks (metrics, stats, team, plans…) |
| `{ "instance": 1 }` | zero-based index into the block list | layout order is guaranteed fixed |
| *(omitted)* | first instance | single-instance pages |

A single-instance offer can stay flat — these are all equivalent:

```json
{ "heading": "..." }
{ "set": { "heading": "..." } }
{ "items": [ { "set": { "heading": "..." } } ] }
```

### Multi-instance metrics example

```json
{
  "items": [
    { "match": { "key": "kpis", "item": "Renewable mix today" }, "set": { "label": "Renewable mix today - Exp A" } },
    { "match": { "key": "kpis", "item": "Active customers" },     "set": { "label": "Active customers - Exp A" } }
  ]
}
```

### Authoring a stable `data-target-key` in Universal Editor

Positional matching (`instance`) is brittle; the robust pattern is to give each
block instance an explicit key that authors control:

1. Add a **"Personalization key"** field to the block's model
   (`component-models.json`), mapping to `data-target-key`.
2. Authors set a unique value per instance (`hero-top`, `hero-bottom`).
3. Offers reference it via `match.key`; `pickBlock` resolves
   `blocks.find((b) => b.dataset.targetKey === key)`.

This keeps personalization stable across reordering, added/removed instances, and
copy edits — the failure modes that break VEC selectors and positional matching.

## Verifying

- Load the page with the `target` metadata flag set.
- In DevTools → Network, confirm the `…/ee/v1/interact` call returns a
  `personalization:decisions` handle containing your scopes with
  `json-content-item` schema.
- Confirm each targeted element updates on load.

## VEC vs Form-Based — quick reference

| | VEC (`dom-action`) | Form-Based (`json-content-item`) |
|---|---|---|
| Carries selector | Yes (fragile on EDS) | No |
| Applied by | `alloy('applyPropositions')` | Custom handler in `scripts/target.js` |
| Best anchor | element id only | `data-target-key` / id / block class / label text |
| Survives EDS decoration | Only id-based selectors | Yes |
| Multiple instances of a block | Separate fragile selector each | `items` array + `match` (key/label/instance) |
| Author effort | Low (point & click) | Offer JSON + one handler function |
