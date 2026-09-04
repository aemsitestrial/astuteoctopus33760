# Persisted GraphQL query: `hero-by-path`

This is the AEM-side companion to the Content-Fragment-driven Hero V2 block. The block calls a
**persisted query** (query text lives on the server, not the client) that returns one hero
fragment for a given path.

## 1. GraphQL query

Author this in AEM (GraphiQL / Persisted Queries UI) against the `hero` Content Fragment Model
(fields per `docs/hero-block/hero.model.json`):

```graphql
query ($path: String!) {
  heroByPath(_path: $path) {
    item {
      _path
      title
      subtitle
      imageAlt
      height
      textAlignment
      imagePosition
      image {
        ... on ImageRef {
          _publishUrl
          _dynamicUrl
        }
      }
      actions {
        actionText
        actionLink
        actionStyle
      }
    }
  }
}
```

## 2. Persist it

Persist the query under the project config with the name the block expects
(`cf.graphql.query.heroByPath` in `/config.json`, default `hero-by-path`):

```bash
# PUT the query text to the persisted-queries endpoint (auth handled by your environment)
curl -X PUT \
  "https://<author-host>/graphql/persist.json/<project>/hero-by-path" \
  -H "Content-Type: application/json" \
  --data-binary @hero-by-path.graphql

# then publish it so it is available on the publish tier
curl -X PUT \
  "https://<author-host>/graphql/persist.json/<project>/hero-by-path/publish"
```

## 3. How the block calls it

The generic fetching lives in the shared service **`scripts/cf-graphql.js`**, so any
CF-backed block can reuse it. `blocks/hero-v2/hero-v2.js` just calls:

```js
import { fetchFragmentByPath, getCfImageUrl } from '../../scripts/cf-graphql.js';

const item = await fetchFragmentByPath('hero-by-path', cfPath);
// item.title, item.subtitle, getCfImageUrl(item.image), item.actions, ...
```

The service builds the request URL from `/config.json`:

```
{cf.graphql.endpoint or /graphql/execute.json}/{cf.graphql.project}/{queryName};path={cfPath}
```

e.g. `GET /graphql/execute.json/hastyfalcon60506/hero-by-path;path=%2Fcontent%2Fdam%2F...%2Fhero-main`

### Reusing the service in another CF-backed block

```js
import { fetchPersistedQuery, fetchFragmentByPath, getCfImageUrl } from '../../scripts/cf-graphql.js';

// one-fragment-by-path pattern (auto-digs data.*.item / .items[0]):
const promo = await fetchFragmentByPath('promo-by-path', '/content/dam/.../promo-1');

// arbitrary persisted query with custom params (returns the raw `data` object):
const data = await fetchPersistedQuery('offers-by-tag', { tag: 'summer', limit: '5' });
```

Endpoint host and project name come from the same `/config.json` keys for every block, so
you configure the environment once.

Expected response shape (the block digs the first `data.*` key defensively, so a differently
named query field still resolves):

```json
{
  "data": {
    "heroByPath": {
      "item": {
        "title": "Energy that works as hard as you do",
        "subtitle": "Transparent pricing, renewable-first supply…",
        "imageAlt": "Rolling green hills at dusk",
        "height": "tall",
        "textAlignment": "center",
        "imagePosition": "center",
        "image": { "_publishUrl": "https://…/hero-main.jpg" },
        "actions": [
          { "actionText": "Check your area", "actionLink": "/area", "actionStyle": "primary" },
          { "actionText": "View plans", "actionLink": "/plans", "actionStyle": "static-light" }
        ]
      }
    }
  }
}
```

## 4. Authoring a CF-driven Hero V2

The author adds a **Hero V2** block whose only content is the Content Fragment path (a link or
plain text starting with `/`, e.g. `/content/dam/hastyfalcon60506/fragments/hero-main`). The
block detects it has no inline image/heading, fetches the fragment, and renders. For a locked
layout, also pick a **Variant** — the variant preset overrides any height/alignment from the CF.

## 5. Caveats

- **CORS / same-origin:** if `cf.graphql.endpoint` points at a different host than the site,
  that host must send `Access-Control-Allow-Origin` for the site. Leaving the endpoint empty
  uses the same-origin path `/graphql/execute.json` (no CORS needed) when AEM is proxied on the
  site domain.
- **Client-side render & SEO:** CF-driven content is fetched in the browser, so crawlers that
  don't execute JS won't see it. For SEO-critical heroes, prefer server-side rendering of the CF
  into the page markup (inline mode) and use CF mode for personalized/secondary heroes.
- **LCP:** a fetched hero image starts loading only after the query resolves, so it is a weaker
  LCP candidate than an inline-authored image. The block reserves height per variant, so there
  is no layout shift, but consider inline mode for above-the-fold heroes.
