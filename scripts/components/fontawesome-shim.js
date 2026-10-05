/*
 * Stand-in for the Font Awesome Pro icon packages imported by the Ignite
 * bundles (scripts/ignite/bundle).
 *
 * The bundles are built with `--external:@fortawesome`, so they keep bare
 * imports such as `import { faChevronRight } from "@fortawesome/pro-regular-svg-icons"`
 * that a browser can't resolve on its own. The import map in head.html (and
 * the Storybook alias in .storybook/main.js) points those specifiers here.
 * Exports use the Font Awesome IconDefinition shape Ignite's icon registry
 * expects — `{ prefix, iconName, icon: [width, height, ligatures, unicode, path] }` —
 * built from the free equivalents in ./icons.js.
 */

import ICONS from './icons.js';

function definition(name, iconName) {
  const [width, height, path] = ICONS[name];
  return {
    prefix: 'fas', iconName, icon: [width, height, [], '', path],
  };
}

export const faArrowUpRightFromSquare = definition('faArrowUpRightFromSquare', 'arrow-up-right-from-square');
export const faChevronRight = definition('faChevronRight', 'chevron-right');
export const faChevronDown = definition('faChevronDown', 'chevron-down');
