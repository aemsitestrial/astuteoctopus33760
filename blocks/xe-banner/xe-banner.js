import { moveInstrumentation } from '../../scripts/scripts.js';
import loadIgnite from '../../scripts/components/ignite.js';
import { createPrimitive, propsFromClasses } from '../../scripts/components/primitives.js';
import { buildButton, loadButton } from '../xe-button/xe-button.js';

/*
 * XE Banner
 *
 * decorate() rebuilds the authored EDS table rows into web-component semantics
 * using <xe-banner> and <xe-banner-column> from @ignite/web (centralized bundle
 * at scripts/ignite/bundle). The heading slot receives a <span> because
 * <xe-banner-column> renders the actual heading element internally based on
 * the `heading-level` attribute. The action is the XE Button primitive
 * (blocks/xe-button) in the banner's fixed CTA style; <xe-icon> is the shared
 * local icon (scripts/components, registered by scripts/components/ignite.js).
 *
 *   <xe-banner size="generous" background="default">
 *     <xe-banner-column expand align="center" heading-level="2">
 *       <xe-icon slot="icon" icon="faLeaf" size="lg"></xe-icon>
 *       <span slot="heading">Save Energy, Save Money</span>
 *       <div slot="message"><p>Explore rebates, tips, and programs…</p></div>
 *       <xe-button slot="action" variant="primary" treatment="outlined" size="sm"
 *                  trailing-icon="faArrowRight" href="…">Explore Programs</xe-button>
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

// <xe-banner> / <xe-banner-column> props (see scripts/components/primitives.js),
// set by the block option classes (the classes_* fields): size-…, background-…, align-….
const BANNER_PROPS = {
  size: { values: ['default', 'compact', 'generous'], option: 'size' },
  background: { values: ['default', 'subtle'], option: 'background' },
};
const COLUMN_PROPS = {
  align: { values: ['center', 'left'], option: 'align' },
  headingLevel: { values: ['1', '2', '3', '4', '5', '6'] },
  expand: { type: 'boolean' },
};

// The banner's call to action: an XE Button in a fixed style.
const ACTION = {
  variant: 'primary', treatment: 'outlined', size: 'sm', trailingIcon: 'faArrowRight',
};

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

  const banner = createPrimitive('xe-banner', {
    size: 'default', background: 'default', ...propsFromClasses(block, BANNER_PROPS),
  }, BANNER_PROPS);

  const column = createPrimitive('xe-banner-column', {
    align: 'center',
    ...propsFromClasses(block, COLUMN_PROPS),
    headingLevel: headingEl ? headingEl.tagName.slice(1) : '2',
    expand: true,
  }, COLUMN_PROPS);
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

  // --- Action: the XE Button primitive, in the banner's fixed CTA style ---
  const label = linkEl ? linkEl.textContent.trim() : '';
  if (label) {
    const button = buildButton({ ...ACTION, label, href: linkEl.getAttribute('href') });
    button.setAttribute('slot', 'action');
    moveInstrumentation(linkEl, button);
    column.append(button);
  }

  block.textContent = '';
  block.append(banner);

  loadIgnite(() => Promise.all([
    import('../../scripts/ignite/bundle/compositions/banner/xe-banner.js'),
    loadButton(),
  ]));
}
