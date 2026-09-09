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

## Two ways to target it

| Goal | Use scope | Section-scoped? | Offer shape |
|---|---|---|---|
| Personalize the hero **only in this section** (by id/name) | `intent-section` | ✅ by section id/name | `{ id, blocks: { hero: {…} } }` |
| Personalize a hero-v3 picked by `instance`/`key` | `hero-v3` | ❌ block-scoped | `{ set: {…} }` |

Both reach the same hero fields (title/subtitle/primaryCta/secondaryCta). Use `intent-section`
when you need to scope to one section; use `hero-v3` when picking by instance/key is enough.

---

## Option A — `intent-section` scope (section-scoped, by model property)

Decision scope: **`intent-section`**. The offer picks the section by its authored **`id`** (or
**`name`**), then a **`blocks`** map keyed by block name applies that block's model-property fields
to the block inside the section. Does not affect an identical block in another section.

```json
{
  "id": "hero-intent",
  "blocks": {
    "hero": {
      "title": "Tea title — Experience A",
      "subtitle": "Start your day with a fresh brew — Experience A",
      "primaryCta": "Order tea",
      "secondaryCta": "Talk to us"
    }
  }
}
```

- `id` (or `name`) — the section's authored id (matches the real `id` / `data-id`) or its `name`
  (`data-name`). Required.
- `blocks` — map keyed by block name. Use `hero` (alias) or `hero-v3` for the section's hero.
- each block's fields are its model properties (`title`, `subtitle`, `primaryCta`,
  `secondaryCta`); unknown fields are ignored.

Match by name, title + subtitle only:

```json
{ "name": "Hero Intent",
  "blocks": { "hero": { "title": "Tea title — Experience A", "subtitle": "Fresh brew every morning" } } }
```

Drive several sections from one offer with an `items` array:

```json
{
  "items": [
    { "id": "hero-intent", "blocks": { "hero": { "title": "Welcome back — Exp A" } } },
    { "id": "promo-intent", "blocks": { "hero": { "title": "Switch and save — Exp A" } } }
  ]
}
```

---

## Option B — `hero-v3` scope (pick by instance/key)

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
3. Add a **location / decision scope** named exactly **`intent-section`** (Option A) or
   **`hero-v3`** (Option B) and assign the JSON offer. Both scopes are requested automatically
   (derived from `FORM_BASED_HANDLERS`).
4. Set audiences/goals and **activate**.

## Which to use

**Option A (`intent-section`)** is section-scoped **and** sets all hero fields including CTAs, so
it is the right choice when you need to target the hero *in a specific section* — no
`data-target-key` needed. **Option B (`hero-v3`)** is simplest when the page has a single hero-v3
or you are happy to pick by `instance`/`key`.

See `docs/hero-block/hero-v3-target-offer.md` and `docs/adobe-target-form-based.md` for the full
contract.
