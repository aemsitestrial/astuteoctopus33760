module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'xwalk/max-cells': ['error', {
      job: 5, 'pricing-plan': 6, 'hero-v2': 6, 'hero-v3': 5, 'xe-hero': 5, 'xe-banner': 5, 'xe-footer': 6, 'xe-card': 5,
    }],
  },
  overrides: [
    {
      // Storybook stories import dev-only packages (e.g. the `storybook/test`
      // subpath export) that the import resolver can't follow but that resolve
      // fine at runtime and under Vitest. These files never ship to the site.
      files: ['**/*.stories.js', '**/*.stories.mjs'],
      rules: {
        'import/no-unresolved': ['error', { ignore: ['^storybook/'] }],
        'import/no-extraneous-dependencies': 'off',
        camelcase: 'off', // model field names (banner_tagline, etc.) match the JSON model
      },
    },
    {
      // Storybook/Vitest config files import dev-only tooling whose subpath
      // exports the import resolver can't follow; they never ship to the site.
      files: ['vitest.config.mjs', '.storybook/**/*.js'],
      rules: {
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      // Build scripts that generate vendored assets; they use dev-only tooling
      // (esbuild) and never ship to the site.
      files: ['blocks/*/vendor/build.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
