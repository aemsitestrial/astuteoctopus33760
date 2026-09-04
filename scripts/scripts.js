import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
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
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
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

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

function initWebSDK(path, config) {
  // Preparing the alloy queue
  if (!window.alloy) {
    // eslint-disable-next-line no-underscore-dangle
    (window.__alloyNS ||= []).push('alloy');
    window.alloy = (...args) => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        window.alloy.q.push([resolve, reject, args]);
      });
    });
    window.alloy.q = [];
  }
  // Loading and configuring the websdk
  return new Promise((resolve) => {
    import(path)
      .then(() => window.alloy('configure', config))
      .then(resolve);
  });
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
      || m.target.dataset.sectionStatus === 'loaded'
      || m.target.dataset.blockStatus === 'loaded')) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), { childList: true });
}

function toCssSelector(selector) {
  return selector.replace(/(\.\S+)?:eq\((\d+)\)/g, (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`);
}

function getElementForProposition(proposition) {
  const selector = proposition.data.prehidingSelector
    || toCssSelector(proposition.data.selector);
  return document.querySelector(selector);
}

const JSON_CONTENT_ITEM_SCHEMA = 'https://ns.adobe.com/personalization/json-content-item';

/**
 * Decision scopes requested for Form-Based (JSON offer) experiences.
 * Each scope maps to an mbox/decision scope configured in the Adobe Target activity.
 * Keep this in sync with FORM_BASED_HANDLERS below.
 */
const FORM_BASED_SCOPES = ['hero', 'metrics', 'feature-cards'];

/**
 * Applies a JSON offer's content to the page for a given scope.
 *
 * Unlike VEC (dom-action) offers, Form-Based offers carry no selector — this code
 * owns *where* the content goes. Anchor to stable elements (ids, block classes),
 * never to positional :nth-child paths, which break after EDS block decoration.
 *
 * The JSON offer authored in Target is available as `content` (an object), e.g.
 *   { "heading": "Energy that works as hard as you do - Testing EXP A" }
 *
 * Each handler returns true when it successfully applied (so we can stop retrying).
 */
const FORM_BASED_HANDLERS = {
  // Hero heading — anchored to the EDS-generated heading id (stable across decoration).
  hero: (content) => {
    const heading = document.querySelector('.hero h1, .hero h2');
    if (heading && content.heading) {
      heading.textContent = content.heading;
      return true;
    }
    return false;
  },
  // "Why Xcel" section heading in the feature-cards block.
  'feature-cards': (content) => {
    const heading = document.querySelector('.feature-cards-container h2, .feature-cards h2');
    if (heading && content.heading) {
      heading.textContent = content.heading;
      return true;
    }
    return false;
  },
  // A labelled metric inside the metrics block (matched by its current label text,
  // so it does not depend on the block's positional structure).
  metrics: (content) => {
    if (!content.label || !content.newLabel) return false;
    const cells = [...document.querySelectorAll('.metrics .metrics-item > div')];
    const target = cells.find((c) => c.textContent.trim() === content.label);
    if (target) {
      target.textContent = content.newLabel;
      return true;
    }
    return false;
  },
};

async function getAndApplyRenderDecisions() {
  // Get the decisions, but don't render them automatically
  // so we can hook up into the AEM EDS page load sequence.
  // decisionScopes requests the Form-Based (JSON offer) experiences in addition
  // to the default __view__ scope used by VEC (dom-action) experiences.
  const response = await window.alloy('sendEvent', {
    renderDecisions: false,
    personalization: {
      decisionScopes: FORM_BASED_SCOPES,
    },
  });
  const { propositions } = response;

  // Track which Form-Based scopes have already been applied so a handler runs once.
  const appliedScopes = new Set();

  onDecoratedElement(async () => {
    // 1) VEC / dom-action offers: let alloy render them against their selectors.
    await window.alloy('applyPropositions', { propositions });
    // keep track of propositions that were applied
    propositions.forEach((p) => {
      p.items = p.items.filter((i) => i.schema !== 'https://ns.adobe.com/personalization/dom-action' || !getElementForProposition(i));
    });

    // 2) Form-Based / JSON offers: apply manually to stable anchors.
    propositions.forEach((p) => {
      const handler = FORM_BASED_HANDLERS[p.scope];
      if (!handler || appliedScopes.has(p.scope)) return;
      const jsonItem = (p.items || []).find((i) => i.schema === JSON_CONTENT_ITEM_SCHEMA);
      const content = jsonItem?.data?.content;
      if (content && handler(content)) {
        appliedScopes.add(p.scope);
      }
    });
  });

  // Reporting is deferred to avoid long tasks
  window.setTimeout(() => {
    // Report shown decisions
    window.alloy('sendEvent', {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: {
          decisioning: { propositions },
        },
      },
    });
  });
}

const alloyLoadedPromise = initWebSDK('./alloy.js', {
  datastreamId: 'd7e718aa-3cf8-429f-bc60-9921cdbed6cc',
  orgId: '0CEB60F754C7E06B0A4C98A2@AdobeOrg',
});

if (getMetadata('target')) {
  alloyLoadedPromise.then(() => getAndApplyRenderDecisions());
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    // await loadSection(main.querySelector('.section'), waitForFirstImage);

    // Wait for alloy to configure — happens before first paint
    await alloyLoadedPromise;

    // Break up long tasks to reduce TBT before showing LCP block
    await new Promise((res) => {
      window.setTimeout(async () => {
        // Newer boilerplate:
        await loadSection(main.querySelector('.section'), waitForFirstImage);
        // Older boilerplate — use this instead:
        // await waitForLCP(LCP_BLOCKS);
        res();
      }, 0);
    });
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
