/*
 * Storybook configuration for AEM Edge Delivery Services blocks.
 *
 * EDS blocks are plain ES modules that export a `decorate(block)` function and
 * ship a sibling stylesheet. They render vanilla DOM — no framework — so the
 * HTML + Vite framework is the natural fit.
 *
 * The repository root is exposed as a static dir so stories can reference the
 * same absolute asset paths the site uses at runtime (`/icons/...`,
 * `/styles/styles.css`, `/blocks/<name>/<name>.css`). This keeps stories
 * rendering against the real CSS instead of a copy that can drift.
 *
 * Addons cover the four Storybook feature areas:
 *   - Documentation:      addon-docs (autodocs + MDX pages)
 *   - Interaction testing: addon-vitest (runs each story's `play` fn)
 *   - Visual testing:      @chromatic-com/storybook (snapshot diffing)
 *   - Accessibility:       addon-a11y (axe checks in the a11y panel)
 */

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    '../blocks/**/*.mdx',
    '../blocks/**/*.stories.@(js|mjs)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  // `storybook/test` (used by story `play` functions) is a bare specifier the
  // browser can't resolve on its own; have Vite pre-bundle it for dev mode.
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    optimizeDeps: {
      ...viteConfig.optimizeDeps,
      include: [...(viteConfig.optimizeDeps?.include || []), 'storybook/test'],
    },
  }),
  // Map the asset dirs blocks reference to their production URL paths, so
  // stories use the same absolute paths as the live site (`/icons/...`,
  // `/blocks/<name>/<name>.css`, ...). Mapping individual dirs (rather than the
  // whole root) avoids copying the build output into itself during `build`.
  staticDirs: [
    { from: '../icons', to: '/icons' },
    { from: '../styles', to: '/styles' },
    { from: '../blocks', to: '/blocks' },
    { from: '../fonts', to: '/fonts' },
  ],
};

export default config;
