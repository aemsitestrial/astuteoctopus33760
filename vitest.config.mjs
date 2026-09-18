/*
 * Vitest config for Storybook interaction tests.
 *
 * The Storybook Vitest plugin turns every story into a test: it mounts the
 * story in a real browser (Playwright/Chromium) and runs its `play` function,
 * failing the test if any assertion or interaction throws. This is the engine
 * behind the "Interaction Testing" feature — the same `play` steps you see run
 * in the Storybook UI also run headless in CI via `npm run test:storybook`.
 */
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
  plugins: [
    storybookTest({ configDir: '.storybook' }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      // Vitest 4 takes a provider factory (not the string 'playwright').
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    // Register the a11y addon's test hook (+ preview.js) so axe-core actually
    // runs per story and the WCAG 2.2 AA config is enforced. addon-vitest does
    // not auto-apply the a11y annotations, so this setup file is required.
    setupFiles: ['./.storybook/vitest.setup.js'],
  },
});
