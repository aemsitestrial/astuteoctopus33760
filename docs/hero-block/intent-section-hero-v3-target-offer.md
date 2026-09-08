# Sample Target JSON offers — Intent Section + hero-v3

How to personalize the **hero-v3** block that lives inside an **Intent Section**
(`models/_intent-section.json`), using the form-based Target handlers in `scripts/target.js`.

## Setup assumed

An Intent Section authored with **Section ID = `hero-intent`** containing one hero-v3 block. After
decoration the relevant DOM is:

```html
<div class="section intent-section-container" id="hero-intent" data-id="hero-intent">
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

## Two ways to target it

| Goal | Use scope | Section-scoped? | Can set CTAs? |
|---|---|---|---|
| Change the hero's **title / subtitle** only, and only in this section | `intent-section` | ✅ by section id | ❌ (text elements only) |
| Change **title / subtitle / CTAs** of a hero-v3 | `hero-v3` | ❌ block-scoped (pick by `instance`/`key`) | ✅ |

If the page has only one hero-v3 and you need the CTAs, the `hero-v3` scope is simplest. If there
are several hero-v3 blocks and you must scope to the one in `#hero-intent`, use `intent-section`
for the text and give the hero a `data-target-key` for CTA targeting (see note at the end).

---

## Option A — `intent-section` scope (section-scoped text)

Decision scope: **`intent-section`**. Matches the section by `id`/`data-id`, then replaces child
text by its current value. Targets the hero-v3 title and subtitle without affecting identical copy
in other sections.

```json
{
  "items": [
    {
      "match": { "section": "hero-intent", "text": "Coffee title" },
      "set":   { "text": "Tea title — Experience A" }
    },
    {
      "match": { "section": "hero-intent", "text": "Drink a delicious coffee in the morning" },
      "set":   { "text": "Start your day with a fresh brew — Experience A" }
    }
  ]
}
```

- `match.section` — the section's `id` (`hero-intent`) or raw `data-id`.
- `match.text` — the exact current trimmed text of the hero title / subtitle.
- `set.text` — the replacement text.

> Anchored by current text, so the offer breaks if the source copy is edited. It cannot change
> the CTAs (anchors are not in the `h1–h6 / p / li` set the handler targets).

---

## Option B — `hero-v3` scope (title, subtitle, and CTAs)

Decision scope: **`hero-v3`**. Sets the block's fields directly. Use this when you need the CTAs.

Full personalization (single hero-v3 on the page):

```json
{
  "set": {
    "heading": "Tea title — Experience A",
    "subtitle": "Start your day with a fresh brew — Experience A",
    "primaryCta": "Order tea",
    "secondaryCta": "Talk to us"
  }
}
```

CTAs only:

```json
{ "set": { "primaryCta": "Order now", "secondaryCta": "Live chat" } }
```

Multiple hero-v3 blocks — pick the intended one by zero-based `instance`:

```json
{
  "items": [
    { "match": { "instance": 0 }, "set": { "heading": "Tea title — Experience A", "primaryCta": "Order tea" } }
  ]
}
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

## Robust CTA targeting scoped to this section (optional)

Option A can't set CTAs and Option B isn't section-scoped. To do both — target the CTAs of the
hero-v3 *in a specific section* — give the block a stable key:

1. Add a **"Personalization key"** field to `blocks/hero-v3/_hero-v3.json` mapped to
   `data-target-key` (e.g. `hero-intent`).
2. Use the `hero-v3` scope with `match.key`:

```json
{
  "items": [
    { "match": { "key": "hero-intent" },
      "set": { "heading": "Tea title — Experience A", "primaryCta": "Order tea", "secondaryCta": "Talk to us" } }
  ]
}
```

See `docs/hero-block/hero-v3-target-offer.md` and `docs/adobe-target-form-based.md` for the full
contract.
