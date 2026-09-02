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
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
      || m.target.dataset.sectionStatus === 'loaded'
      || m.target.dataset.blockStatus === 'loaded')) {
      fn(() => observer.disconnect());
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

  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn(() => observer.disconnect());
  }
}

function toCssSelector(selector) {
  return selector.replace(/(\.\S+)?:eq\((\d+)\)/g, (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`);
}

function getElementForProposition(proposition) {
  const selector = proposition.data.prehidingSelector
    || toCssSelector(proposition.data.selector);
  return document.querySelector(selector);
}

const DOM_ACTION_SCHEMA = 'https://ns.adobe.com/personalization/dom-action';
const JSON_CONTENT_SCHEMA = 'https://ns.adobe.com/personalization/json-content-item';

async function getAndApplyRenderDecisions() {
  const response = await window.alloy('sendEvent', {
    renderDecisions: true,
    personalization: {
      decisionScopes: ['target-global-mbox'],
    },
  });
  const { propositions } = response;

  // Pre-compute the manual JSON offer for the "hero" scope (not renderable by alloy)
  const heroProposition = propositions.find((p) => p.scope === 'target-global-mbox');
  const heroJsonItem = heroProposition?.items.find((i) => i.schema === JSON_CONTENT_SCHEMA);
  const heroContent = heroJsonItem?.data?.content;
  let heroApplied = false;

  onDecoratedElement((disconnect) => {
    // Only hand DOM-action propositions to alloy; JSON offers are applied manually below.
    const domPropositions = propositions
      .map((p) => ({ ...p, items: (p.items || []).filter((i) => i.schema === DOM_ACTION_SCHEMA) }))
      .filter((p) => p.items.length);
    if (domPropositions.length) {
      window.alloy('applyPropositions', { propositions: domPropositions });
      // Drop DOM actions that have now been applied so we don't re-apply them.
      propositions.forEach((p) => {
        p.items = (p.items || []).filter(
          (i) => i.schema !== DOM_ACTION_SCHEMA || !getElementForProposition(i),
        );
      });
    }

    // Manually apply the "hero" JSON offer once.
    if (!heroApplied && heroContent?.heading) {
      const heading = document.querySelector('.hero h1, .hero h2'); // adjust selector
      if (heading) {
        heading.textContent = heroContent.heading;
        heroApplied = true;
      }
    }

    // Stop observing once all pending work is complete.
    const domPending = propositions.some(
      (p) => (p.items || []).some((i) => i.schema === DOM_ACTION_SCHEMA),
    );
    const heroPending = !!heroContent?.heading && !heroApplied;
    if (!domPending && !heroPending) {
      disconnect();
    }
  });

  window.setTimeout(() => {
    window.alloy('sendEvent', {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: { decisioning: { propositions } },
      },
    });
  });
}

// Initialise immediately — promise is awaited in loadEager
const alloyLoadedPromise = initWebSDK('./alloy.js', {
  datastreamId: 'd7e718aa-3cf8-429f-bc60-9921cdbed6cc',
  orgId: '0CEB60F754C7E06B0A4C98A2@AdobeOrg',
});

const ALLOWED_TARGET_HOSTS = [
  'www.accenture.com',
  'main--hastyfalcon60506--aemsitestrial.aem.live',
  // add other approved production/staging hostnames here
];

const isTargetHost = ALLOWED_TARGET_HOSTS.some((h) => window.location.hostname === h)
  || window.location.hostname === 'localhost';

if (getMetadata('target') && isTargetHost) {
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
