# Sample Target JSON offers — Intent Section + hero-v3

How to personalize the **hero-v3** block that lives inside an **Intent Section**
(`models/_intent-section.json`), using the form-based Target handlers in `scripts/target.js`.

## Setup assumed

An Intent Section authored with **Section ID = `hero-intent`** containing one hero-v3 block. After
decoration the relevant DOM is:

```html
<div class="section intent-section-container" id="hero-intent" data-id="hero-intent" data-name="Hero Intent">
  <div class="hero-v3-wrapper">
    <div class="hero-v3 block hero-height-responsive hero-align-center …" data-block-name="hero-v3">
      <div class="hero-media">…</div>
      <div class="hero-content">
        <h2 class="hero-title">Coffee title</h2>
        <p class="hero-subtitle">Drink a delicious coffee in the morning</p>
        <div class="hero-actions">
          <a class="hero-action hero-action-primary" href="/">Get a coffee</a>
          <a class="hero-action hero-action-static-light" href="/">Contact us</a>
        </div>
      </div>
    </div>
  </div>
</div>
```

## hero-v3 model-property fields

Both scopes below use the hero-v3 block's **model property names** (from
`blocks/hero-v3/_hero-v3.json`) as the field names — not raw element text. So an offer survives
copy edits and reads the way an author thinks about the block:

| field | Model property | Personalizes |
|---|---|---|
| `title` | Title | the hero headline (`.hero-title`) |
| `subtitle` | Subtitle | the subtitle (`.hero-subtitle`) |
| `primaryCta` | Primary action text | the primary button label |
| `secondaryCta` | Secondary action text | the secondary button label |

> `heading` is accepted as a back-compat alias for `title`.

## Three ways to target it

| Goal | Use scope | Section-scoped? | Offer shape |
|---|---|---|---|
| Simplest — pick the section by naming the scope after its id | `<section id>` (e.g. `hero-intent`) | ✅ automatic | `{ blocks: [ { hero: {…} } ] }` |
| Target one/more sections from a single scope | `intent-section` | ✅ by id/name in offer | `{ id, blocks: [ { hero: {…} } ] }` |
| Personalize a hero-v3 picked by `instance`/`key` | `hero-v3` | ❌ block-scoped | `{ set: {…} }` |

All reach the same hero fields (title/subtitle/primaryCta/secondaryCta). Prefer the section-id
scope (Option A) for the simplest offer; use `intent-section` when one activity drives several
named sections; use `hero-v3` when picking by instance/key is enough.

---

## Option A (simplest) — scope named after the section id

Every **Intent Section** that has an authored **Section ID** is automatically offered to Target as
its **own decision scope** (the scope name *is* the section id). So you can pick the section just
by naming the location/scope, and the JSON offer only needs `blocks` — no `id`/`name` inside it.

> Only **Intent Sections** get a per-id scope. The scope is keyed off the section's `id`
> attribute, and only the intent-section model exposes an id field — so a plain section is never
> exposed as a scope, regardless of what blocks it contains.

Decision scope: **`hero-intent`** (the section's id). Offer:

```json
{
  "blocks": [
    {
      "hero": {
        "title": "Tea title — Experience A",
        "subtitle": "Start your day with a fresh brew — Experience A",
        "primaryCta": "Order tea",
        "secondaryCta": "Talk to us"
      }
    }
  ]
}
```

A bare `blocks` array as the whole offer content also works:

```json
[ { "hero": { "title": "Tea title — Experience A" } } ]
```

- The **scope name** must equal the section's id (e.g. `hero-intent`). No `intent-section` scope,
  no `id` field in the offer.
- `blocks` — same shape as Option B below: an array of `{ "<blockName>": { …fields } }` (`hero`
  alias or `hero-v3`).
- Scoping is automatic: the offer only touches the section whose id matches the scope.

> Requires the section to have a **Section ID** authored (rendered as a real `id` attribute). The
> available scopes are discovered from the page at request time, so a newly-added section id is
> picked up automatically — no code change.

---

## Option B — `intent-section` scope (section-scoped, by model property)

Decision scope: **`intent-section`**. The offer picks the section by its authored **`id`** (or
**`name`**), then **`blocks`** — an array of single-key objects — applies each block's
model-property fields to the block inside the section. Does not affect an identical block in
another section.

```json
{
  "id": "hero-intent",
  "blocks": [
    {
      "hero": {
        "title": "Tea title — Experience A",
        "subtitle": "Start your day with a fresh brew — Experience A",
        "primaryCta": "Order tea",
        "secondaryCta": "Talk to us"
      }
    }
  ]
}
```

- `id` (or `name`) — the section's authored id (matches the real `id` / `data-id`) or its `name`
  (`data-name`). Required.
- `blocks` — an array of `{ "<blockName>": { …fields } }` objects. Use `hero` (alias) or `hero-v3`
  for the section's hero. (A `{ "<blockName>": {…} }` map is also accepted.)
- each block's fields are its model properties (`title`, `subtitle`, `primaryCta`,
  `secondaryCta`); unknown fields are ignored.

Match by name, title + subtitle only:

```json
{ "name": "Hero Intent",
  "blocks": [ { "hero": { "title": "Tea title — Experience A", "subtitle": "Fresh brew every morning" } } ] }
```

Drive several sections from one offer with an `items` array:

```json
{
  "items": [
    { "id": "hero-intent",  "blocks": [ { "hero": { "title": "Welcome back — Exp A" } } ] },
    { "id": "promo-intent", "blocks": [ { "hero": { "title": "Switch and save — Exp A" } } ] }
  ]
}
```

---

## Option C — `hero-v3` scope (pick by instance/key)

Decision scope: **`hero-v3`**. Sets the block's fields directly; pick which hero-v3 with
`match.instance` (zero-based) or `match.key` (a `data-target-key`).

```json
{
  "items": [
    { "match": { "instance": 0 },
      "set": { "title": "Tea title — Experience A", "primaryCta": "Order tea" } }
  ]
}
```

Single hero-v3 on the page — flat offer:

```json
{ "set": { "title": "Tea title — Experience A", "subtitle": "Fresh brew every morning" } }
```

> `set` fields update **text only** (the CTA `href` is preserved). Changing a CTA link needs a VEC
> offer or a handler extension — Target-authored text bypasses the block's `isSafeUrl` check.

---

## Authoring in Adobe Target

1. **Offers → Create → JSON Offer** using one of the shapes above.
2. Create an **A/B** or **Experience Targeting** activity with the **Form-Based Experience
   Composer**.
3. Add a **location / decision scope** and assign the JSON offer:
   - Option A — name it after the **section id** (e.g. `hero-intent`).
   - Option B — name it **`intent-section`**.
   - Option C — name it **`hero-v3`**.

   The section-id scopes are discovered from the page automatically; the `intent-section` and
   `hero-v3` scopes are derived from `FORM_BASED_HANDLERS`.
4. Set audiences/goals and **activate**.

## Which to use

**Option A (section-id scope)** is the simplest — name the scope after the section id and ship a
blocks-only offer; scoping is automatic. **Option B (`intent-section`)** puts the id/name inside
the offer, handy when one activity drives several named sections via an `items` array. **Option C
(`hero-v3`)** is fine when the page has a single hero-v3 or you pick by `instance`/`key`. All three
set the same hero fields, including CTAs.

See `docs/hero-block/hero-v3-target-offer.md` and `docs/adobe-target-form-based.md` for the full
contract.
