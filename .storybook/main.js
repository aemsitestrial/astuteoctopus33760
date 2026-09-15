/*
 * Storybook configuration for AEM Edge Delivery Services blocks.
 *
 * EDS blocks are plain ES modules that export a `decorate(block)` function and
 * ship a sibling stylesheet. They render vanilla DOM — no framework — so the
 * HTML + Vite framework is the natural fit.
 *
 * Asset dirs are exposed as static dirs so stories reference the same absolute
 * paths the site uses at runtime (`/icons/...`, `/styles/styles.css`). NOTE:
 * `blocks/` is intentionally NOT mapped — the story modules live there, and a
 * static mapping would shadow Vite's module transform for the stories (serving
 * them raw so bare imports break and the story renders empty). Block CSS is
 * loaded through Vite instead (see .storybook/eds.js).
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
  // Map the non-code asset dirs to their production URL paths so stories use the
  // same absolute paths as the live site. `blocks/` is deliberately excluded
  // (see the note above) — its CSS is resolved through Vite in eds.js.
  staticDirs: [
    { from: '../icons', to: '/icons' },
    { from: '../styles', to: '/styles' },
    { from: '../fonts', to: '/fonts' },
  ],
};

export default config;
