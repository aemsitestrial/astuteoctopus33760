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
     { "heading": "Energy that works as hard as you do - Testing EXP A" }
     ```
   - Feature-cards heading (`feature-cards` scope):
     ```json
     { "heading": "Energy made simple, honest, and green - Text Experience A" }
     ```
   - Metrics label (`metrics` scope):
     ```json
     { "label": "Renewable mix today", "newLabel": "Renewable mix today - Test experience A" }
     ```

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

```js
const FORM_BASED_HANDLERS = {
  hero: (content) => { /* set .hero h1/h2 text from content.heading */ },
  'feature-cards': (content) => { /* set feature-cards h2 from content.heading */ },
  metrics: (content) => { /* find metrics cell by content.label, set content.newLabel */ },
};
```

### Adding a new form-based experience

1. Add the scope name to `FORM_BASED_SCOPES`.
2. Add a handler under the same key in `FORM_BASED_HANDLERS`.
3. Anchor to something stable:
   - **Best:** an element `id` (EDS auto-generates heading ids), e.g. `#some-heading`.
   - **Good:** a block class + content match (as `metrics` does by label text).
   - **Avoid:** `:nth-child` / `:nth-of-type` positional paths.
4. Shape the Target JSON offer to match the fields the handler reads.

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
| Best anchor | element id only | id / block class / label text |
| Survives EDS decoration | Only id-based selectors | Yes |
| Author effort | Low (point & click) | Offer JSON + one handler function |
