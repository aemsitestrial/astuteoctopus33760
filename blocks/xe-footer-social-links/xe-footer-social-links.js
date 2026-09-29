import { keepInstrumentation } from '../../scripts/components/xe-footer-utils.js';

/*
 * XE Footer Social Link — child item of XE Footer V2, one per social profile.
 *
 * The item's Network select + Profile URL (cta_linkText + cta_link) collapse
 * into one authored link, <a href="profile URL">network</a>. decorate(item)
 * turns it into the footer's social icon button, which XE Footer V2 slots
 * straight into <xe-footer>:
 *
 *   <xe-icon-button slot="social" size="xl" href="…" target="_blank"
 *                   aria-label="Facebook (opens in a new window)">
 *     <xe-icon icon="faSquareFacebook"></xe-icon>
 *   </xe-icon-button>
 *
 * The item's Universal Editor instrumentation moves onto the button (or an
 * editor-only placeholder while the item has no profile URL yet). The item
 * holds plain fields, not a multi-field: multi-fields are an early-access
 * feature and render empty unless Adobe enables them for the program.
 */

// Social networks, keyed by the item's "Network" select value, with their
// icon (scripts/components/icons.js). `match` also recognizes a network from
// its profile URL or a free-text label.
const SOCIAL_NETWORKS = {
  facebook: { label: 'Facebook', icon: 'faSquareFacebook', match: /facebook/i },
  x: { label: 'X', icon: 'faSquareXTwitter', match: /^x$|twitter|(^|\/\/|\.)x\.com/i },
  instagram: { label: 'Instagram', icon: 'faInstagram', match: /instagram/i },
  linkedin: { label: 'LinkedIn', icon: 'faSquareLinkedin', match: /linkedin/i },
  youtube: { label: 'YouTube', icon: 'faYoutube', match: /youtube/i },
};

// Rendered when no social links are authored (the live Xcel Energy footer's).
const DEFAULT_SOCIAL_LINKS = [
  ['facebook', 'https://www.facebook.com/XcelEnergy'],
  ['x', 'https://twitter.com/XcelEnergy'],
  ['instagram', 'https://www.instagram.com/xcelenergy'],
  ['linkedin', 'https://www.linkedin.com/company/xcel-energy'],
  ['youtube', 'https://www.youtube.com/XcelEnergyVideo'],
];

/**
 * The network key for a social link (or null), from its text, its accessible
 * name or icon alt text (icon-only rich-text links), or its URL.
 */
export function socialNetwork(anchor) {
  const img = anchor.querySelector('img');
  const names = [anchor.textContent, anchor.getAttribute('aria-label'), img && img.alt]
    .map((name) => (name || '').trim())
    .filter(Boolean);
  const href = anchor.getAttribute('href') || '';
  const found = Object.entries(SOCIAL_NETWORKS).find(([key, { match }]) => match.test(href)
    || names.some((name) => name.toLowerCase() === key || match.test(name)));
  return found ? found[0] : null;
}

/** True when `container` holds links and every one points to a known social network. */
export function isSocialLinks(container) {
  const links = [...container.querySelectorAll('a')];
  return links.length > 0 && links.every((anchor) => socialNetwork(anchor));
}

/** An Ignite icon button linking to a social profile in a new window. */
function socialButton(network, href) {
  const { label, icon } = SOCIAL_NETWORKS[network];
  const button = document.createElement('xe-icon-button');
  button.setAttribute('slot', 'social');
  button.setAttribute('size', 'xl');
  button.setAttribute('href', href);
  button.setAttribute('target', '_blank');
  button.setAttribute('aria-label', `${label} (opens in a new window)`);
  const glyph = document.createElement('xe-icon');
  glyph.setAttribute('icon', icon);
  button.append(glyph);
  return button;
}

/** The icon buttons for the live Xcel Energy footer's social profiles. */
export function decorateDefaults() {
  return DEFAULT_SOCIAL_LINKS.map(([network, href]) => socialButton(network, href));
}

/**
 * Builds the social icon buttons for an item row (or any element holding
 * social links, such as a legacy rich-text field). A link to a network without
 * an icon button is kept as authored.
 * @param {Element} item the authored item row
 * @returns {Element[]} the elements to slot into <xe-footer>
 */
export default function decorate(item) {
  const buttons = [...item.querySelectorAll('a')].map((anchor) => {
    const network = socialNetwork(anchor);
    if (network) return socialButton(network, anchor.getAttribute('href') || '');
    anchor.setAttribute('slot', 'social');
    return anchor;
  });
  return keepInstrumentation(item, buttons, 'social', 'Add a social link');
}
