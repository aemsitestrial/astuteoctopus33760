# Adobe Target on EDS — Form-Based Experiences (JSON offers)

This guide explains how to convert a Target activity from **Visual Experience
Composer (VEC)** targeting to **Form-Based Experience Composer** targeting, and
how the code in `scripts/scripts.js` applies those experiences.

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
   Shape them to match the handlers in `scripts.js` (see Part 3):

   - Hero (`hero` scope):
     ```json
     { "set": { "heading": "Energy that works as hard as you do - Testing EXP A" } }
     ```
   - Feature-cards heading (`feature-cards` scope):
     ```json
     { "set": { "heading": "Energy made simple, honest, and green - Text Experience A" } }
     ```
   - Metrics label (`metrics` scope) — `match.label` locates the cell, `set.label`
     is the new text:
     ```json
     { "items": [ { "match": { "label": "Renewable mix today" }, "set": { "label": "Renewable mix today - Test experience A" } } ] }
     ```

   > For pages with several instances of the same block, use the `items` array with
   > a per-instance `match`. See *Multiple instances of the same block* below.

2. **Create the activity** (A/B or Experience Targeting) and choose the
   **Form-Based Experience Composer** (not Visual).

3. **Add a location (mbox / decision scope) per experience.** Name each scope to
   match `FORM_BASED_SCOPES` in `scripts.js`: `hero`, `metrics`, `feature-cards`.

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

## Part 3 — Code (`scripts/scripts.js`)

Two things drive the integration:

- **`FORM_BASED_SCOPES`** — the list of decision scopes requested. Must match the
  scope/mbox names in the Target activity.
- **`FORM_BASED_HANDLERS`** — one function per scope that reads the JSON `content`
  and writes it to a **stable anchor**. Each returns `true` once applied so it
  runs only once as blocks decorate.

Handlers use three shared helpers:

- **`getBlocks(blockClass)`** — all instances of a block on the page.
- **`pickBlock(blocks, match)`** — selects one instance from a `match` descriptor
  (`{ key }`, `{ instance }`, or default = first). See *Multiple instances* below.
- **`applyInstructions(content, applyOne)`** — normalises an offer to a list of
  `{ match, set }` instructions and applies each; returns `true` only when *all*
  applied, so the scope stops retrying.

```js
const FORM_BASED_HANDLERS = {
  hero: (content) => applyInstructions(content, (match, set) => {
    const heading = pickBlock(getBlocks('hero'), match)?.querySelector('h1, h2');
    if (heading && set.heading) { heading.textContent = set.heading; return true; }
    return false;
  }),
  // feature-cards + metrics follow the same shape (see scripts.js)
};
```

### Adding a new form-based experience

1. Add the scope name to `FORM_BASED_SCOPES`.
2. Add a handler under the same key in `FORM_BASED_HANDLERS`, using
   `applyInstructions` + `pickBlock` so it supports multiple instances for free.
3. Anchor to something stable:
   - **Best:** a `data-target-key` on the block (authorable in UE — see below), or
     an element `id` (EDS auto-generates heading ids), e.g. `#some-heading`.
   - **Good:** a block class + content match (as `metrics` does by label text).
   - **Avoid:** `:nth-child` / `:nth-of-type` positional paths.
4. Shape the Target JSON offer to match the fields the handler reads.

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

`match` supports three strategies, best-first:

| `match` | Selects | When to use |
|---|---|---|
| `{ "key": "hero-top" }` | block whose `data-target-key` = `hero-top` | **preferred** — position-independent, authorable in UE |
| `{ "label": "Renewable mix today" }` | element found by its text (metrics) | content is uniquely identifiable by text |
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
    { "match": { "key": "kpis", "label": "Renewable mix today" }, "set": { "label": "Renewable mix today - Exp A" } },
    { "match": { "key": "kpis", "label": "Active customers" },     "set": { "label": "Active customers - Exp A" } }
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
| Applied by | `alloy('applyPropositions')` | Custom handler in `scripts.js` |
| Best anchor | element id only | `data-target-key` / id / block class / label text |
| Survives EDS decoration | Only id-based selectors | Yes |
| Multiple instances of a block | Separate fragile selector each | `items` array + `match` (key/label/instance) |
| Author effort | Low (point & click) | Offer JSON + one handler function |
