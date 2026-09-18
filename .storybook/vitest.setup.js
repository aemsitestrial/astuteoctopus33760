/*
 * Vitest setup for Storybook interaction + accessibility tests.
 *
 * addon-vitest applies the project's own preview.js annotations automatically,
 * but the accessibility addon's test hook (the `afterEach` that runs axe-core
 * and fails the test on violations) is NOT auto-applied — it ships as a
 * separate set of preview annotations. Registering both here via
 * setProjectAnnotations wires that hook into every story run, so the WCAG 2.2 AA
 * config in preview.js is actually enforced by `npm run test:storybook`
 * (without this, axe never runs and non-compliant stories pass silently).
 */
import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/html-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as previewAnnotations from './preview.js';

const project = setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);

beforeAll(project.beforeAll);
