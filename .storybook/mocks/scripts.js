/*
 * Side-effect-free stand-in for the site's `scripts/scripts.js`, used by
 * Storybook only (wired via a Vite alias in .storybook/main.js).
 *
 * The real scripts.js calls `loadPage()` at module scope, which boots the whole
 * page runtime (fetches config, decorates the document, loads header/footer).
 * Blocks import small pure helpers from it — e.g. `moveInstrumentation` — so
 * importing the real module into a story would drag in that entire runtime and
 * break the isolated render. This mock re-exports just those helpers, copied
 * verbatim from scripts.js, with no top-level side effects.
 *
 * Keep these in sync with scripts/scripts.js if the originals change.
 */

/**
 * Moves the given attributes from one element to another.
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from one element to another.
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}
