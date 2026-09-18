# Storybook for EDS blocks

Storybook renders each AEM Edge Delivery Services block in isolation, using the
block's real `decorate()` function and its shipped CSS — so what you see matches
production rendering.

## Running

```bash
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in ./storybook-static
npm run test:storybook   # run every story's interaction (play) test headless
```

## Features enabled

| Storybook feature | How it's set up |
| --- | --- |
| **Development** | `argTypes` controls that map one-to-one to each block's authoring model, so editing a control mimics editing the field in the Universal Editor. |
| **Interaction Testing** | `@storybook/addon-vitest` runs each story's `play` function in a real browser (Playwright/Chromium). Run in the UI or via `npm run test:storybook`. |
| **Visual Testing** | `@chromatic-com/storybook` snapshots each story and flags pixel diffs. |
| **Documentation** | `@storybook/addon-docs` renders per-block MDX pages (`blocks/<name>/<name>.mdx`) with a live Controls table. |
| **Accessibility** | `@storybook/addon-a11y` runs axe checks on every story (a11y panel), configured in `preview.js` to enforce **WCAG 2.2 AA**; violations fail `npm run test:storybook`. |

## How it works

EDS wraps every block in a section/wrapper/block DOM chain and runs the block's
`decorate()` against it. `.storybook/eds.js` reproduces that chain so stories
exercise the exact same code path:

- `renderBlock({ name, rows, decorate })` builds
  `main > .section > .<name>-wrapper > .<name>.block`, fills it with authored
  rows/cells, loads `/blocks/<name>/<name>.css`, and runs `decorate()`.
- `main.js` maps `/icons`, `/styles`, `/blocks`, `/fonts` to their real files so
  stories use the same absolute asset URLs as the live site.
- `preview.js` loads the global `styles.css` / `fonts.css` so blocks inherit the
  site's design tokens and typography.

## Authoring-model controls

To make controls mirror the Universal Editor, drive the story from the block's
model (`blocks/<name>/_<name>.json`) instead of raw rows:

1. Define an `args` object with one entry per model field.
2. Add an `argTypes` entry per field, choosing the control by model type
   (`text`/`richtext` fields → `text` control; `reference` fields → `text`
   control holding the asset URL). Group related fields with `table.category`.
3. Write a `fieldsToRows(args)` helper that assembles the args into the row/cell
   structure the block's decorator expects, then
   `render: (args) => renderBlock({ name, rows: fieldsToRows(args), decorate })`.

See `blocks/xe-footer/xe-footer.stories.js` for a worked example.

## Adding a story for a new block

Create `blocks/<name>/<name>.stories.js` (and optionally `<name>.mdx` for docs).
Follow the authoring-model pattern above so the controls match the block's
fields. Add a `play` function per story to assert the decorated structure — that
doubles as the interaction test.
