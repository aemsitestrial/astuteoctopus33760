import { toClassName } from '../aem.js';

/**
 * Reads a block's properties: props passed in win, then the authored content, then the defaults.
 * Fields are read one row per field, in model order. When the fields share a prefix they're
 * grouped into a single cell with one <p> per field, so a single row (or cell) holding several
 * fields is read one <p> per field instead.
 * Settings passed as props are set by code, so they have no authored field and are skipped
 * when matching the authored values to settings.
 * @param {Element} block the block element, or a row of another block that holds the fields
 * @param {Object} defaults default value by field name, keys in the same order as the model
 * @param {Object} [props] settings set by code, by field name
 * @returns {Object} property value by field name
 */
export function getBlockProps(block, defaults, props = {}) {
  const authored = Object.keys(defaults).filter((name) => !Object.hasOwn(props, name));
  const children = [...block.children];
  const grouped = authored.length > 1 && children.length === 1;
  const paragraphs = grouped ? [...children[0].querySelectorAll('p')] : [];
  const cells = paragraphs.length ? paragraphs : children;
  const values = Object.fromEntries(authored.map((name, i) => [
    name,
    cells[i]?.textContent.trim() || defaults[name],
  ]));
  return { ...defaults, ...values, ...props };
}

/**
 * Reads the properties of a block whose model groups its links and authors its settings
 * as classes, like xe-hyperlink:
 *   link_cta + link_ctaText    -> collapsed into one <a href="{cta}">{ctaText}</a>
 *   classes_trailingIcon       -> boolean, class "trailingIcon" on the block when on
 *   classes_type, classes_...  -> select, the selected value as a class on the block
 * The kind of each field comes from its default:
 *   a string with a matching {name}Text key is a link, read from the block's links in order;
 *   false is a boolean class option; an array is the list of values of a select class option,
 *   default first. Options render as class names (lowercased, with characters other than
 *   letters and digits replaced by hyphens and trimmed, so "_blank" becomes "blank"), so
 *   names and values are compared as class names and the value from defaults is returned.
 * @param {Element} block the block element
 * @param {Object} defaults default value by field name, without the group prefix
 * @param {Object} [props] settings set by code, by field name
 * @returns {Object} property value by field name
 */
export function getLinkBlockProps(block, defaults, props = {}) {
  const classes = [...block.classList].map(toClassName);
  const hasClass = (name) => classes.includes(toClassName(String(name)));
  const links = [...block.querySelectorAll('a')];
  const values = {};
  Object.entries(defaults).forEach(([name, value]) => {
    if (typeof value === 'boolean') {
      values[name] = hasClass(name);
    } else if (Array.isArray(value)) {
      values[name] = value.find((option) => option && hasClass(option)) ?? value[0];
    } else if (Object.hasOwn(defaults, `${name}Text`)) {
      const a = links.shift();
      values[name] = a?.getAttribute('href') || value;
      values[`${name}Text`] = a?.textContent.trim() || defaults[`${name}Text`];
    } else if (!Object.hasOwn(values, name)) {
      values[name] = value;
    }
  });
  return { ...values, ...props };
}

/**
 * Checks whether a link points to another site.
 * Relative paths, anchors and non-web links (mailto:, tel:) are not external.
 * @param {string} href the link
 * @returns {boolean} true when the link leaves the current site
 */
export function isExternalLink(href) {
  if (!href) return false;
  try {
    const url = new URL(href, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

/**
 * Resolves the link settings of a block with an href, linkType and target.
 * An external href gets linkType external and opens in a new tab, unless the author
 * picked a link type or target other than the defaults (auto and empty).
 * @param {Object} props block properties with href, linkType and target
 * @returns {Object} the properties with the resolved linkType and target
 */
export function resolveLinkProps(props) {
  if (!isExternalLink(props.href)) return props;
  const linkType = String(props.linkType || 'auto').toLowerCase();
  return {
    ...props,
    linkType: linkType === 'auto' ? 'external' : props.linkType,
    target: props.target || '_blank',
  };
}
