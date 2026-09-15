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
 */

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../blocks/**/*.stories.@(js|mjs)'],
  addons: [],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
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
