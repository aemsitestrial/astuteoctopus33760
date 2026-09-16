/*
 * Regenerates blocks/xe-ignite-feature-cards-npm/vendor/igniteui-webcomponents.js
 * — the vendored, self-contained ESM bundle of the Ignite UI components the
 * xe-ignite-feature-cards-npm block uses. Run via
 * `npm run build:xe-ignite-feature-cards-npm-vendor` (e.g. after bumping the
 * igniteui-webcomponents dependency).
 *
 * The components are sourced from the `igniteui-webcomponents` npm package in
 * node_modules and bundled here (tree-shaken + minified) so they are served
 * from our own origin instead of a CDN, and so EDS can import them at runtime
 * (browsers can't resolve the bare `igniteui-webcomponents` specifier).
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

// Re-export only the components this block needs (+ defineComponents).
const entry = `export {
  defineComponents,
  IgcCardComponent,
  IgcCardHeaderComponent,
  IgcCardContentComponent,
  IgcCardActionsComponent,
  IgcButtonComponent,
} from 'igniteui-webcomponents';`;

await build({
  stdin: {
    contents: entry,
    resolveDir: repoRoot,
    loader: 'js',
  },
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'none',
  outfile: resolve(here, 'igniteui-webcomponents.js'),
});

// eslint-disable-next-line no-console
console.log('Wrote blocks/xe-ignite-feature-cards-npm/vendor/igniteui-webcomponents.js');
