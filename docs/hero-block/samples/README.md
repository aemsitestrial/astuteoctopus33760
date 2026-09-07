# Hero V2 — sample Content Fragment model & instances

Sample assets for the Content-Fragment-driven Hero V2 block (`blocks/hero-v2`). All values are
safe and non-sensitive (no PII, secrets, or tracking parameters). Hosts/paths use placeholder
values you replace for your environment.

| File | What it is | Use it for |
|---|---|---|
| `hero-v2.model.json` | The Content Fragment **Model** definition | Recreate the `hero-v2` CF Model in AEM (field names, types, allowed values, defaults) |
| `hero-main.cf.json` | A CF **instance** (standard · center · 2 actions) | Author-time reference for a fragment's field values |
| `hero-promo.cf.json` | A CF **instance** (tall · left · 1 action, no subtitle) | Shows a minimal hero variant |
| `hero-by-path.response.json` | The **GraphQL response** the block actually consumes | Mock/fixture for the persisted query `hero-by-path`; matches what `normalizeFragment()` reads |

## Field reference

Field names map 1:1 to what `blocks/hero-v2/hero-v2.js` reads:

| CF field | Type | Notes |
|---|---|---|
| `title` | text | Headline → heading element |
| `subtitle` | text | Optional supporting copy |
| `image` | asset reference | Delivered as `_publishUrl`/`_dynamicUrl`; resolved by `getCfImageUrl()` |
| `imageAlt` | text | Falls back to `alt=""` when empty |
| `actions[]` | multifield (max 2) | `{ actionText, actionLink, actionStyle }`; first=primary, second=static-light |
| `height` | enum | `responsive` \| `tall` \| `standard` \| `compact` (base block only) |
| `textAlignment` | enum | `center` \| `left` (base block only) |
| `imagePosition` | enum | `center` \| `top` \| `bottom` (base block only) |

`height` / `textAlignment` / `imagePosition` only affect the **base** block; a locked Variant
class (e.g. `tall-center-with-action`) overrides them.

## How the block fetches these

The block calls the persisted query `hero-by-path` with the fragment path and renders the
result. See `../persisted-query-hero-by-path.md` for the query text, publish steps, and the
`/config.json` keys (endpoint, project, query name).

```js
import { fetchFragmentByPath, getCfImageUrl } from '../../scripts/cf-graphql.js';
const item = await fetchFragmentByPath('hero-by-path', '/content/dam/.../hero-main');
```

## Recreating the model & instances in AEM

1. **Model:** in AEM → Content Fragment Models, create a model named `hero-v2` with the fields
   in `hero-v2.model.json` (or import via the CF Model API).
2. **Instances:** create fragments under a DAM path (e.g.
   `/content/dam/hastyfalcon60506/fragments/`) using `hero-main.cf.json` /
   `hero-promo.cf.json` as the field values; point the `image` field at a real DAM asset.
3. **Author a block:** add a **Hero V2** block whose only content is the fragment path
   (e.g. `/content/dam/hastyfalcon60506/fragments/hero-main`); optionally pick a Variant.
