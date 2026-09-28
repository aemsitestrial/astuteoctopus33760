import { moveInstrumentation } from '../../scripts/scripts.js';
import '../../scripts/components/xe-button.js';
import '../../scripts/components/xe-icon.js';

/*
 * XE Banner
 *
 * decorate() rebuilds the authored EDS table rows into web-component semantics
 * using <xe-banner> and <xe-banner-column> from @ignite/web (vendored as
 * ./vendor/xe-banner-ignite.js). The heading slot receives a <span> because
 * <xe-banner-column> renders the actual heading element internally based on
 * the `heading-level` attribute. <xe-button> and <xe-icon> are the shared
 * local components (scripts/components) to avoid conflicts with xe-hero.
 *
 *   <xe-banner size="generous" background="default">
 *     <xe-banner-column expand align="center" heading-level="2">
 *       <xe-icon slot="icon" icon="faLeaf" size="lg"></xe-icon>
 *       <span slot="heading">Save Energy, Save Money</span>
 *       <div slot="message"><p>Explore rebates, tips, and programs…</p></div>
 *       <xe-button slot="action" variant="primary" treatment="outlined" size="sm" href="…">
 *         Explore Programs<xe-icon slot="trailing-icon" size="sm" icon="faArrowRight"></xe-icon>
 *       </xe-button>
 *     </xe-banner-column>
 *   </xe-banner>
 */

// Authored icon option (see the "icon" field in _xe-banner.json) -> <xe-icon> name.
const ICON_OPTIONS = {
  none: '',
  leaf: 'faLeaf',
  bolt: 'faBolt',
  lightbulb: 'faLightbulb',
  house: 'faHouse',
  'piggy-bank': 'faPiggyBank',
};

// Block option classes (the classes_* fields) -> <xe-banner>/<xe-banner-column> attributes.
const SIZES = ['compact', 'generous'];
const BACKGROUNDS = ['subtle'];
const ALIGNMENTS = ['left'];

// Load and register the @ignite/web banner components once, shared across all instances.
let ignitePromise;
function loadIgnite() {
  if (!ignitePromise) {
    ignitePromise = import('./vendor/xe-banner-ignite.js').catch(() => {
      // Load failure: the decorated fallback content still renders, so swallow
      // the error rather than break the page.
    });
  }
  return ignitePromise;
}

/** Returns the value of the first `<prefix>-<value>` block class in `values`. */
function optionFromClass(block, prefix, values) {
  return values.find((value) => block.classList.contains(`${prefix}-${value}`));
}

export default function decorate(block) {
  const rows = [...block.children];

  // Classify authored rows by content (model field order in _xe-banner.json:
  // icon, heading, message, action), so blank or missing rows are tolerated.
  let iconName = '';
  let headingEl = null;
  let messageCell = null;
  let linkEl = null;

  rows.forEach((row) => {
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    const text = cell.textContent.trim();
    const link = cell.querySelector('a');
    if (!linkEl && link) {
      linkEl = link;
      return;
    }
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (!headingEl && heading) {
      headingEl = heading;
      return;
    }
    const iconKey = text.toLowerCase();
    if (!headingEl && !messageCell && Object.hasOwn(ICON_OPTIONS, iconKey)) {
      iconName = ICON_OPTIONS[iconKey];
      return;
    }
    if (!messageCell && text) messageCell = cell;
  });

  const size = optionFromClass(block, 'size', SIZES) || 'default';
  const background = optionFromClass(block, 'background', BACKGROUNDS) || 'default';
  const align = optionFromClass(block, 'align', ALIGNMENTS) || 'center';
  const level = headingEl ? headingEl.tagName.slice(1) : '2';

  const banner = document.createElement('xe-banner');
  banner.setAttribute('size', size);
  banner.setAttribute('background', background);

  const column = document.createElement('xe-banner-column');
  column.setAttribute('expand', '');
  column.setAttribute('align', align);
  column.setAttribute('heading-level', level);
  banner.append(column);

  // --- Icon ---
  if (iconName) {
    const icon = document.createElement('xe-icon');
    icon.setAttribute('slot', 'icon');
    icon.setAttribute('icon', iconName);
    icon.setAttribute('size', 'lg');
    column.append(icon);
  }

  // --- Heading ---
  // xe-banner-column renders the heading element (<hN>) internally; the slot
  // receives a <span> so the DOM outline stays correct without nesting headings.
  if (headingEl && headingEl.textContent.trim()) {
    const heading = document.createElement('span');
    heading.setAttribute('slot', 'heading');
    heading.textContent = headingEl.textContent.trim();
    moveInstrumentation(headingEl, heading);
    column.append(heading);
  }

  // --- Message (rich text: keep the authored paragraphs/inline markup) ---
  if (messageCell) {
    const message = document.createElement('div');
    message.setAttribute('slot', 'message');
    moveInstrumentation(messageCell, message);
    message.append(...messageCell.childNodes);
    column.append(message);
  }

  // --- Action ---
  const label = linkEl ? linkEl.textContent.trim() : '';
  if (label) {
    const button = document.createElement('xe-button');
    button.setAttribute('slot', 'action');
    button.setAttribute('variant', 'primary');
    button.setAttribute('treatment', 'outlined');
    button.setAttribute('size', 'sm');
    const href = linkEl.getAttribute('href');
    if (href) button.setAttribute('href', href);
    moveInstrumentation(linkEl, button);

    const arrow = document.createElement('xe-icon');
    arrow.setAttribute('slot', 'trailing-icon');
    arrow.setAttribute('size', 'sm');
    arrow.setAttribute('icon', 'faArrowRight');

    button.append(label, arrow);
    column.append(button);
  }

  block.textContent = '';
  block.append(banner);

  loadIgnite();
}
