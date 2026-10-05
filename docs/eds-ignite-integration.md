# EDS + Ignite integration: meeting prep

Findings from integrating the `@ignite/web` components with AEM Edge Delivery
Services (EDS) and Universal Editor authoring, on the `feat/web-components`
branch.

## What exists today

- **Blocks:** XE Banner, XE Footer V2 and its three child items (link columns,
  social links, legal links) render with the Ignite components.
- **Integration layer:** a thin layer (`scripts/components/ignite.js`, the
  import map in `head.html`, `tokens.css`) makes the committed Ignite bundles
  work inside EDS. Everything in that layer is a workaround for one of the
  Ignite issues below.

## 1. Bundle and packaging issues (the main asks for the Ignite team)

| Issue | What happens in EDS | What we did | Ask |
|---|---|---|---|
| Bare Font Awesome Pro imports (bundles are built with `--external:@fortawesome`) | The bundle won't load in a browser. `pro-solid` isn't even a dependency. | Import map pointing to free-icon stand-ins | Bundle the icons, or provide a documented icon-injection API |
| Every composition bundle inlines its own `xe-icon`, `xe-hyperlink`, `xe-accordion`, … and calls `customElements.define` without checking | A second bundle, or an element the site already registered, throws and aborts the whole bundle | Patched `customElements.define` to skip names already registered | Check before defining, or ship shared primitives as one separate bundle |
| The icon registry is private to each bundle, and `registerIcons` isn't exported | The accordion's `faChevronDown` is never registered, so the chevron is blank | The local `<xe-icon>` renders all icons page-wide | Export `registerIcons`, or register every icon a component uses |
| `cms.css` includes global resets (`* {margin:0;padding:0}`, body/h1–h6/p/a styles) and automatic dark mode | It restyles every EDS block, and the footer switches colors for dark-mode users | Generated a tokens-only `tokens.css` | Ship tokens separately from base styles; make dark mode opt-in |
| Google Fonts `@import` in the theme | An extra render-blocking request from a third party; affects the site's Lighthouse score and privacy/Content Security Policy rules | Kept as is (open) | Self-hostable fonts |
| Each bundle carries its own copy of Lit plus tokens for every component (the footer bundle is about 6,000 lines) | Duplicated weight on every page | – | Share Lit and split per-component tokens |
| Private registries (Xcel JFrog, Font Awesome Pro); Node 22 or newer | CI needs secrets. EDS has no build step, so the bundle must be committed (81 files), and only people with registry access can regenerate it | Added CI secrets; the bundle is regenerated with `copy:ignite:package` | Agree who owns rebuilding and versioning the bundle |

## 2. Component behavior the Ignite developers should know about

- **Accessibility:** below 1024px, `xe-footer-column` drops its `<ul>` but keeps
  the `<li>` items, which is a serious WCAG 1.3.1 violation (axe `listitem`).
  We work around it by removing list semantics on mobile. Its breakpoint is
  also hard-coded, so we have to mirror it in our code.
- **Global EDS styles win over `::slotted()`.** The site's `h*`/`p`/`a`/`img`
  rules override Ignite's slot styling, so every block needs light-DOM CSS
  fixes. One real bug came from this: a link in the copyright line failed
  contrast.
- **Slots expect bare `<img>`.** EDS delivers `<picture>` with responsive
  sources, so we rebuild a `srcset` on the image. Ask them to support
  `<picture>` in image slots.
- **Content passed as attributes** (for example `heading="Company"`) lives only
  in shadow DOM. Authors can't edit it in place in the Universal Editor, and
  it's not a real light-DOM heading. Prefer slots for authorable text.
- **Tag name clashes:** our local `<xe-button>`/`<xe-icon>` and Ignite's share
  names. The team needs to agree on one source for each primitive.

## 3. EDS and Universal Editor constraints Ignite should design around

- **No multi-fields:** multi-fields and composite multi-fields are
  early-access and render empty unless Adobe enables them. Repeatable content
  has to be separate child items or rich-text lists. This is why the footer's
  social links are one item per link and the link columns are rich text.
- **Rows, not attributes:** published markup is table rows with no model
  names, and fields may be missing. Decorators have to recognize content, not
  rely on its position.
- **Instrumentation:** every authorable element needs `data-aue-*` moved onto a
  light-DOM element with a visible box. Components shouldn't swallow or
  re-parent light-DOM children unexpectedly (the column wraps links in `<li>`
  elements itself).
- **No hard validation:** Universal Editor events fire after the save and only
  `aue:navigate` can be cancelled. Limits like "5 social links" are done by
  switching the block's `data-aue-filter` plus a render-time cap. It works, but
  that filter switch isn't documented behavior.
- **Loading:** bundles load asynchronously, so blocks wait for them to avoid
  showing unstyled content. Keep the bundle small, and make the footer and hero
  bundles cheap to load.

## 4. Decisions to get out of the meeting

1. Who owns the bundle build, and how are versions and releases communicated?
2. Will Ignite fix the four bundle issues (Font Awesome imports, duplicate
   registrations, icon registry, global theme CSS), or should the workarounds
   stay long-term?
3. Should Ignite or the local `scripts/components` be the single source for
   `xe-button` and `xe-icon`?
4. Will Adobe be asked to enable multi-fields? That would simplify authoring.
5. Who fixes accessibility defects found in Ignite components, and on what
   timeline?

## 5. Worth bringing

- **A live demo:** XE Footer V2 in the Universal Editor, showing the content
  tree, the empty-item placeholders and the 5-link limit.
- **Storybook:** the XE Banner and XE Footer V2 stories, with the axe results.
- **Evidence:** the `scripts/components/ignite.js` loader and the import map,
  each workaround linked to the Ignite issue it covers.
