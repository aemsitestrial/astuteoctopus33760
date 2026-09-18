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
| `primaryCtaLink` | Primary action link | the primary button `href` |
| `secondaryCtaLink` | Secondary action link | the secondary button `href` |
| `image` | Background image | the hero background image (`src`) |

> `heading` is accepted as a back-compat alias for `title`.
>
> **Link/image fields are URL-safety-checked.** `primaryCtaLink`, `secondaryCtaLink`, and `image`
> values must be an `https:`/`http:` or same-origin relative URL; `javascript:`, `data:`,
> `vbscript:` and protocol-relative (`//…`) values are rejected. `image` swaps the `<picture>`
> background (its `<source>`s are dropped so the new URL wins at every breakpoint).

## Two ways to target it

| Goal | Use scope | Section-scoped? | Offer shape |
|---|---|---|---|
| Personalize the hero **in a specific section** | `<section id>` (e.g. `hero-intent`) | ✅ automatic | `{ blocks: [ { hero: {…} } ] }` |
| Personalize a hero-v3 picked by `instance`/`key` | `hero-v3` | ❌ block-scoped | `{ set: {…} }` |

Both reach the same hero fields (title/subtitle/primaryCta/secondaryCta). Prefer the section-id
scope (Option A) — it is section-scoped with the simplest offer; use `hero-v3` (Option B) when the
page has a single hero-v3 or you are happy to pick by instance/key.

---

## Option A — scope named after the section id (recommended)

Every **Intent Section** that has an authored **Section ID** is automatically offered to Target as
its **own decision scope** (the scope name *is* the section id). This is a composite scoped to that
one section: point a Target activity at the scope and the JSON offer only needs `blocks` — no
`id`/`name` inside it, and no touching an identical hero in another section.

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

Personalizing the image and CTA links too:

```json
{
  "blocks": [
    {
      "hero": {
        "title": "Winter sale — up to 30% off",
        "primaryCta": "Shop the sale",
        "primaryCtaLink": "/sale",
        "secondaryCtaLink": "https://example.com/terms",
        "image": "/content/dam/hastyfalcon60506/images/winter-hero.jpg"
      }
    }
  ]
}
```

- The **scope name** must equal the section's id (e.g. `hero-intent`).
- `blocks` — an array of `{ "<blockName>": { …fields } }` (`hero` alias or `hero-v3`); a
  `{ "<blockName>": {…} }` map is also accepted.
- each block's fields are its model properties (`title`, `subtitle`, `primaryCta`,
  `secondaryCta`); unknown fields are ignored.
- Scoping is automatic: the offer only touches the section whose id matches the scope.
- A `blocks` key is either a **block name** (`hero` / `hero-v3`, which targets the *first*
  matching block in the section) or an **auto-generated child-block id** (see below) to target
  one specific block when the section repeats a block type.

### Addressing a specific block by its generated id

Every child block of a section gets a stable, auto-generated `id`
(`decorateIntentSectionBlockIds` in `scripts/scripts.js`) following:

```
[section-id-or-name]-[block-name]-[iteration]
```

The iteration suffix only appears when the same block type repeats inside the section — the first
occurrence is left unsuffixed:

| Blocks in section `hero-intent` | Generated id |
|---|---|
| first `hero-v3` | `hero-intent-hero-v3` |
| second `hero-v3` | `hero-intent-hero-v3-2` |
| a `feature-cards` | `hero-intent-feature-cards` |

> When a section has no authored **Section ID** but has a **Section Name**, the normalized name is
> used as the prefix instead (e.g. Section Name `Promo Zone` → `promo-zone-hero-v3`).

Use the generated id as the `blocks` key to personalize one specific iteration — the plain block
name always targets the first instance:

```json
{
  "blocks": [
    { "hero-intent-hero-v3":   { "title": "First hero — Experience A" } },
    { "hero-intent-hero-v3-2": { "title": "Second hero — Experience A" } }
  ]
}
```

The id is resolved within the scoped section, so an id from another section is never matched.

> Requires the section to have a **Section ID** authored (rendered as a real `id` attribute). The
> available scopes are discovered from the page at request time, so a newly-added section id is
> picked up automatically — no code change. Personalize several sections by running one activity
> per section-id scope.

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
3. Add a **location / decision scope** and assign the JSON offer:
   - Option A — name it after the **section id** (e.g. `hero-intent`).
   - Option B — name it **`hero-v3`**.

   The section-id scopes are discovered from the page automatically; the `hero-v3` scope is derived
   from `FORM_BASED_HANDLERS`.
4. Set audiences/goals and **activate**.

## Which to use

**Option A (section-id scope)** is the recommended path — section-scoped, with the simplest offer:
name the scope after the section id and ship a blocks-only offer. To personalize several sections,
run one activity per section-id scope. **Option B (`hero-v3`)** is fine when the page has a single
hero-v3 or you pick by `instance`/`key`. Both set the same hero fields, including CTAs.

See `docs/hero-block/hero-v3-target-offer.md` and `docs/adobe-target-form-based.md` for the full
contract.
