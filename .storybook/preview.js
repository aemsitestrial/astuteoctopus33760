/*
 * Global Storybook preview config.
 *
 * Loads the site's global stylesheets (design tokens, fonts, base typography)
 * so blocks render inside the same cascade they get on the live site.
 * `styles.css` defines the CSS custom properties (--body-font-family, colors,
 * spacing) that blocks inherit.
 *
 * The stylesheets are injected as <link> tags pointing at their production URLs
 * (served by the `staticDirs` mapping in main.js) rather than ESM `import`ed.
 * A bare `import '../styles/styles.css'` collides with the `/styles` static
 * mapping — Vite serves the file statically as text/css, but the import expects
 * a JS module, which the browser rejects. Linking the served file sidesteps
 * that and uses the exact same CSS the live site loads.
 */
['/styles/styles.css', '/styles/fonts.css'].forEach((href) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
});

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Blocks like the footer are full-bleed; give them the whole canvas.
    layout: 'fullscreen',
    // Accessibility: enforce WCAG 2.2 AA on every story (all blocks).
    // addon-a11y runs axe-core; restricting `runOnly` to the WCAG A + AA tags
    // up to 2.2 makes the a11y panel and the automated test run check exactly
    // that conformance level (the tags are cumulative — 2.2 AA includes the
    // 2.0/2.1 success criteria). `test: 'error'` promotes any violation to a
    // failure, so `npm run test:storybook` fails on non-compliant blocks
    // instead of only flagging them in the UI panel.
    a11y: {
      test: 'error',
      options: {
        runOnly: {
          type: 'tag',
          values: [
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'wcag22a',
            'wcag22aa',
          ],
        },
      },
    },
  },
};

export default preview;
