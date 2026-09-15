# Storybook for EDS blocks

Storybook renders each AEM Edge Delivery Services block in isolation, using the
block's real `decorate()` function and its shipped CSS — so what you see matches
production rendering.

## Running

```bash
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build in ./storybook-static
```

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

## Adding a story for a new block

Create `blocks/<name>/<name>.stories.js`:

```js
import decorate from './<name>.js';
import { renderBlock, picture } from '../../.storybook/eds.js';

export default {
  title: 'Blocks/<Name>',
  render: (args) => renderBlock({ name: '<name>', rows: args.rows, decorate }),
};

export const Default = {
  // rows -> cells, as HTML strings, in the order an author would create them.
  args: { rows: [['<p>cell content</p>']] },
};
```

The `rows` array mirrors the authored block table: one entry per row, each an
array of cell HTML strings. Match the order the block's model/decorator expects.
