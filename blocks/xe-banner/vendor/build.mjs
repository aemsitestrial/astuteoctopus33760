/*
 * Regenerates blocks/xe-banner/vendor/xe-banner-ignite.js
 * — the vendored, self-contained ESM bundle of the @ignite/web banner
 * components used by the xe-banner block. Run via
 * `npm run build:xe-banner-vendor` (e.g. after bumping the @ignite/web dep).
 *
 * EDS serves JS as plain ESM; browsers cannot resolve the bare `@ignite/web`
 * specifier, so the components are bundled here and served from our origin.
 * XEBanner's import of xe-banner-column.js is included automatically.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

// Import directly from the composition path to avoid pulling in all of
// @ignite/web's main barrel (which includes components with missing peer deps).
// xe-banner.js transitively imports xe-banner-column.js, so both get bundled.
const entry = `import '@ignite/web/compositions/banner/xe-banner.js';`;

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
  outfile: resolve(here, 'xe-banner-ignite.js'),
});

// eslint-disable-next-line no-console
console.log('Wrote blocks/xe-banner/vendor/xe-banner-ignite.js');
