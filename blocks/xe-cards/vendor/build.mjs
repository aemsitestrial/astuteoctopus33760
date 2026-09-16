/*
 * Regenerates blocks/xe-cards/vendor/igniteui-webcomponents.js — the vendored,
 * self-contained ESM bundle of the Ignite UI card components the xe-cards block
 * uses. Run via `npm run build:xe-cards-vendor` (e.g. after bumping the
 * igniteui-webcomponents dependency).
 *
 * We bundle only the components xe-cards needs (tree-shaken + minified) so the
 * vendored file stays small and is served from our own origin instead of a CDN.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

// Re-export only the card components (+ defineComponents) from the package.
const entry = `export {
  defineComponents,
  IgcCardComponent,
  IgcCardMediaComponent,
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
console.log('Wrote blocks/xe-cards/vendor/igniteui-webcomponents.js');
