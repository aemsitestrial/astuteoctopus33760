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
  },
};

export default preview;
