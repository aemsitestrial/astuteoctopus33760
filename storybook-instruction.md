# Storybook Instructions for EDS Blocks

This repo uses **Storybook 10** (`@storybook/html-vite`) to render each AEM Edge
Delivery Services (EDS) block in isolation, using the block's **real
`decorate()` function** and its **shipped CSS** — so what you see in Storybook
matches production rendering. This document explains how the setup works and how
to add a story for a new block.

## Commands

```bash
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in ./storybook-static
npm run test:storybook   # run every story's interaction (play) test headless
```

## Features enabled

| Feature | Addon / mechanism | What it gives you |
| --- | --- | --- |
| **Development** | `argTypes` controls | Each control maps one-to-one to a block's authoring-model field, so editing a control mimics editing that field in the Universal Editor. |
| **Interaction testing** | `@storybook/addon-vitest` | Runs each story's `play` function in a real browser (Playwright/Chromium). Run in the UI or via `npm run test:storybook`. |
| **Visual testing** | `@chromatic-com/storybook` | Snapshots each story and flags pixel diffs. |
| **Documentation** | `@storybook/addon-docs` | Renders per-block MDX pages (`blocks/<name>/<name>.mdx`) with a live Controls table. |
| **Accessibility** | `@storybook/addon-a11y` | Runs axe checks on every story (a11y panel), configured for **WCAG 2.2 AA** conformance. |

## Directory layout

```
.storybook/
  main.js        # Storybook config: stories glob, addons, framework, static dirs, Vite alias
  preview.js     # Global preview config: loads styles.css/fonts.css, sets fullscreen layout
  eds.js         # Test harness: rebuilds the EDS DOM chain and runs a block's decorate()
  README.md      # Short overview (this file is the fuller guide)
  mocks/
    scripts.js   # Side-effect-free stand-in for scripts/scripts.js
vitest.config.mjs # Vitest browser config that turns every story into an interaction test
blocks/<name>/
  <name>.js          # the block decorator (default export)
  <name>.css         # the block's shipped stylesheet
  _<name>.json       # the authoring model (drives the controls)
  <name>.stories.js  # the stories
  <name>.mdx         # optional docs page
```

## How the harness works (`.storybook/eds.js`)

At runtime EDS wraps every block in a section/wrapper/block chain and runs the
block's `decorate()` against it:

```html
<main>
  <div class="section">
    <div class="<name>-wrapper">
      <div class="<name> block">   <!-- decorate() receives this element -->
        <div>                       <!-- a row -->
          <div>...</div>            <!-- a cell -->
        </div>
      </div>
    </div>
  </div>
</main>
```

Block stylesheets frequently target that full chain (e.g. `xe-footer` scopes
`main > .section > .xe-footer-wrapper`), so the harness rebuilds the whole
structure — not just the block element. The two exported helpers:

- **`renderBlock({ name, rows, decorate, variants })`** — builds the wrapper
  chain, fills the block with authored `rows` (each row an array of cells, each
  cell an HTML string), loads `/blocks/<name>/<name>.css`, runs `decorate(block)`,
  and returns the `<main>` for Storybook to mount. `decorate()` may be async; the
  synchronous DOM mutations it performs first are enough for a static render.
- **`picture(src, alt)`** — returns `<picture><img …></picture>` matching EDS's
  optimized-image markup, so image cells look like real authored output.

Block CSS is resolved through Vite (`import.meta.glob('/blocks/*/*.css', …)`),
**not** via a static dir — see the config notes below.

## Config notes (`.storybook/main.js`, `preview.js`)

- **Stories glob**: `../blocks/**/*.mdx` and `../blocks/**/*.stories.@(js|mjs)`.
- **`staticDirs`** map `/icons`, `/styles`, `/fonts` to their real folders so
  stories use the same absolute asset URLs as the live site.
- **`blocks/` is intentionally NOT a static dir.** The story modules live under
  `blocks/`; mapping it statically would shadow Vite's module transform for the
  stories (serving them raw, so bare imports break and the story renders empty).
  Block CSS is loaded through Vite instead.
- **`scripts.js` alias**: a Vite alias redirects any `…/scripts/scripts.js`
  import to `.storybook/mocks/scripts.js`. The real `scripts.js` calls
  `loadPage()` at module scope (booting the whole page runtime); the mock
  re-exports only the pure helpers blocks need (e.g. `moveInstrumentation`),
  with no side effects. **Keep the mock in sync with `scripts/scripts.js`** if
  those helpers change.
- **`preview.js`** injects `/styles/styles.css` and `/styles/fonts.css` as
  `<link>` tags (not ESM imports, which would collide with the `/styles` static
  mapping) so blocks inherit the site's design tokens and typography. It also
  sets `layout: 'fullscreen'` because blocks like the footer are full-bleed.
- **`body.appear`**: `preview.js` adds the `appear` class to `<body>`. `styles.css`
  ships `body { display: none }` and the live site only reveals it once
  `scripts.js` adds `appear` after load; Storybook never runs that boot, so
  without this every story would render at 0×0 — which also makes axe treat all
  elements as hidden and silently skip every accessibility rule.

## Accessibility testing (WCAG 2.2 AA)

- `preview.js` sets the global `a11y` parameter to run only the WCAG A + AA tags
  through 2.2 with `test: 'error'`, so axe violations **fail**
  `npm run test:storybook`.
- `.storybook/vitest.setup.js` registers the a11y addon's preview annotations
  via `setProjectAnnotations` so the addon's axe `afterEach` actually runs under
  Vitest (it is not auto-applied), and `vitest.config.mjs` wires that file in via
  `setupFiles`. Without both the a11y wiring **and** `body.appear` above, the
  a11y checks pass vacuously (axe runs on a hidden, unlaid-out body and finds
  nothing).

## Authoring-model controls (the core pattern)

To make controls mirror the Universal Editor, **drive the story from the block's
model (`blocks/<name>/_<name>.json`) instead of raw rows**:

1. Define a `defaults` (a.k.a. `args`) object with one entry per model field.
2. Add an `argTypes` entry per field, choosing the control by model type:
   - `text` / `richtext` fields → `text` control (richtext holds HTML).
   - `reference` (image) fields → `text` control holding the asset URL.
   - `aem-content` (link) fields → `text` control holding the href.
   - Group related fields with `table: { category: '…' }`.
3. Write a `fieldsToRows(args)` helper that assembles the args into the row/cell
   structure the decorator expects, then:
   ```js
   render: (args) => renderBlock({ name: '<name>', rows: fieldsToRows(args), decorate })
   ```
4. Omit empty fields from the rows so the decorator sees the same shape it would
   for an author who left a field blank.

`blocks/xe-footer/xe-footer.stories.js` is the canonical worked example.

### Repeatable items (multifields)

Storybook controls are a **fixed schema** — there is no runtime add/remove of
groups. For a repeatable model item (e.g. cards), expose a **fixed number of
slots** (`MAX_CARDS`) and surface each slot's fields under its own
`table.category` (`"Card 1"`, `"Card 2"`, …), which reads like a multifield in
the Controls panel. A slot with no meaningful content (e.g. no title and no
text) is treated as empty and not rendered.

Pattern (see `xe-feature-cards` and `xe-cards`):

- `fieldName(i, key)` → flat arg key like `card1Title`.
- `cardsToArgs(cards)` spreads an array of card objects across the flat slot args.
- `argsToCards(args)` collects the flat args back into an ordered list, dropping
  empty slots.
- Build `argTypes` in a loop, one group per slot.

## Stories & interaction tests

Each named export is a story. Add a `play` function to assert the decorated
structure — this **doubles as the interaction test** run by
`npm run test:storybook`:

```js
import { expect, within } from 'storybook/test';

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.xe-footer')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.xe-footer-links-col')).toHaveLength(3);
  },
};
```

- Use `within(canvasElement)` + `getByText(...)` for content assertions and
  `canvasElement.querySelectorAll(...)` for structure/counts.
- For blocks that load resources asynchronously (e.g. `xe-cards` loading Ignite),
  use `waitFor(() => expect(...).toBeTruthy(), { timeout })`.
- Story-level `args` override the default `args` to exercise variants (fewer
  cards, no links, single column, etc.).

## Docs (`.mdx`)

Optional per-block MDX page renders alongside the stories:

```mdx
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as XeFooterStories from './xe-footer.stories.js';

<Meta of={XeFooterStories} />

# XE Footer
…prose, an authoring-model table…
<Canvas of={XeFooterStories.Default} />
<Controls of={XeFooterStories.Default} />
```

When a block ships a custom `.mdx`, do **not** also enable autodocs for it (the
default config does not tag stories with `autodocs`, so a hand-written MDX page
is the single docs source).

## Adding a story for a new block — checklist

1. Confirm the block exports a default `decorate(block)` and ships
   `blocks/<name>/<name>.css`.
2. Create `blocks/<name>/<name>.stories.js`:
   - Import `decorate` from `./<name>.js` and `renderBlock` (+ `picture` if the
     block has images) from `../../.storybook/eds.js`.
   - Build `defaults`, `argTypes`, and a `fieldsToRows(args)` helper from the
     block's `_<name>.json` model (use the multifield pattern for repeatables).
   - Default export: `{ title: 'Blocks/<Name>', argTypes, args: defaults, render, parameters }`.
   - Add named-export stories, each with a `play` function.
3. (Optional) Create `blocks/<name>/<name>.mdx` following the pattern above.
4. If the block imports helpers from `scripts/scripts.js`, make sure the needed
   helper exists in `.storybook/mocks/scripts.js`.
5. Verify: `npm run storybook` (visual), `npm run test:storybook` (interaction),
   check the a11y panel, and confirm the Controls mirror the authoring model.

## Reference examples

- `blocks/xe-footer/` — model-driven controls with grouped categories; a
  full-bleed block whose CSS targets the whole wrapper chain.
- `blocks/xe-feature-cards/` — the multifield (repeatable-slot) pattern.
- `blocks/xe-cards/` — multifield plus an async-loading dependency (Ignite web
  components) handled with `waitFor` in the `play` function.
