# Hero V3 — Adobe Target JSON offer contract

Hero V3 is wired into the project's form-based Target integration (`scripts/target.js`) under the
decision scope **`hero-v3`**. Target returns a JSON offer for that scope and the handler applies
it to the block's stable, post-decoration anchors — no VEC selectors, nothing to break on EDS
re-decoration. See `docs/adobe-target-form-based.md` for the general model.

## Handler & anchors

```js
'hero-v3': blockHandler('hero-v3', {
  heading:      '.hero-title',
  subtitle:     '.hero-subtitle',
  primaryCta:   '.hero-actions a.hero-action-primary',
  secondaryCta: '.hero-actions a.hero-action-static-light',
}),
```

| `set` field | Personalizes | Anchor |
|---|---|---|
| `heading` | Title text | `.hero-title` |
| `subtitle` | Subtitle text | `.hero-subtitle` |
| `primaryCta` | Primary button label | `.hero-actions a.hero-action-primary` |
| `secondaryCta` | Secondary button label | `.hero-actions a.hero-action-static-light` |

> Fields set **text only** (via `textContent`), preserving instrumentation and the CTA `href`.
> To change a CTA destination, use a VEC/dom-action offer or extend the handler — Target-authored
> text does not run through the block's `isSafeUrl` check.

## Sample offers

### 1. Single hero — full personalization (flat)

```json
{
  "set": {
    "heading": "Welcome back — pick up where you left off",
    "subtitle": "Your saved plan is ready to review.",
    "primaryCta": "Resume application",
    "secondaryCta": "Compare other plans"
  }
}
```

### 2. Heading only

```json
{ "set": { "heading": "Energy that works as hard as you do — Experience A" } }
```

### 3. Multiple Hero V3 instances on one page (`items` + `match`)

A decision scope maps to the **block type**, so when a page has more than one Hero V3, disambiguate
with an `items` array. Preferred match is a `data-target-key` the author sets per instance (see
"Stable key" below); `instance` (zero-based) is the positional fallback.

```json
{
  "items": [
    {
      "match": { "key": "hero-top" },
      "set": { "heading": "Welcome back — Experience A", "primaryCta": "Resume" }
    },
    {
      "match": { "key": "hero-promo" },
      "set": { "heading": "Switch and save this winter — Experience A" }
    }
  ]
}
```

Positional fallback when no key is authored:

```json
{
  "items": [
    { "match": { "instance": 0 }, "set": { "heading": "First hero — Exp A" } },
    { "match": { "instance": 1 }, "set": { "heading": "Second hero — Exp A" } }
  ]
}
```

### 4. Hero V3 inside a composite `page` offer

Drive Hero V3 alongside other blocks from one offer/one activity via the `page` scope:

```json
{
  "blocks": {
    "hero-v3": {
      "set": { "heading": "Welcome back — Experience A", "subtitle": "Your saved plan is ready." }
    },
    "metrics": {
      "items": [
        { "match": { "item": "Renewable mix today" }, "set": { "value": "91%" } }
      ]
    }
  }
}
```

## Authoring in Adobe Target

1. **Offers → Create → JSON Offer** using one of the shapes above (`set` fields must match the
   table).
2. Create an **A/B** or **Experience Targeting** activity with the **Form-Based Experience
   Composer**.
3. Add a **location / decision scope** named exactly **`hero-v3`** and assign the JSON offer.
4. Set audiences/goals and **activate**. The page requests the `hero-v3` scope automatically
   (it is derived from `FORM_BASED_HANDLERS`).

## Stable key for multi-instance targeting (optional)

Positional `instance` matching is brittle. For robust targeting, add a personalization key the
author controls, then reference it with `match.key`:

1. Add a **"Personalization key"** field to `blocks/hero-v3/_hero-v3.json`, mapped to
   `data-target-key`.
2. Author a unique value per instance (`hero-top`, `hero-promo`).
3. `pickBlock` resolves `blocks.find((b) => b.dataset.targetKey === key)`.

## Verifying

- Load the page with the `target` metadata flag set.
- DevTools → Network: the `…/ee/v1/interact` response should include a `hero-v3` scope with a
  `json-content-item` schema.
- Confirm the hero's title/subtitle/CTA text updates on load.

## Accessibility reminder for Target authors

- Don't remove the heading element — screen-reader users navigate by heading. This handler only
  replaces its text, which is safe.
- Keep CTA labels meaningful; a changed button must not be left with a stale accessible name.
- Re-check contrast if an experience implies a different background image.
