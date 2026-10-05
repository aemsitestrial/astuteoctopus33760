/*
 * Helpers for primitive blocks — blocks that render one @ignite/web primitive
 * (<xe-button>, …) and export a builder other blocks reuse:
 *
 *   import { buildButton, loadButton } from '../xe-button/xe-button.js';
 *
 * A primitive's props are described once, by a schema keyed by prop name:
 *
 *   const PROPS = {
 *     variant: { values: ['primary', 'secondary'], option: 'variant' },
 *     treatment: { values: ['filled', 'outlined'], aliases: { outline: 'outlined' } },
 *     sizeMobile: { values: ['sm', 'md'], option: 'size-mobile' },
 *     expand: { type: 'boolean', option: 'expand' },
 *     href: {},
 *   };
 *
 * Each entry may set:
 *   - type      'string' (default) or 'boolean' (a presence attribute)
 *   - attribute the element attribute (default: the prop in kebab-case, so
 *               sizeMobile → size-mobile, ariaLabel → aria-label)
 *   - values    the allowed values; anything else is ignored
 *   - aliases   accepted alternative spellings → their value
 *   - option    the authored block class carrying the prop (the classes_*
 *               fields of a model): `<option>-<value>` for a string prop,
 *               `<option>` for a boolean one
 *   - optionValues  for a string prop, block class suffix → value, when the
 *               class can't be the value itself (e.g. icon names, `_blank`)
 *
 * applyProps() sets a schema's props on an element (validated, so a builder
 * can take props from authored content, other blocks or code alike);
 * propsFromClasses() reads them back from a block's classes.
 */

/** A prop name as an attribute name: sizeMobile → size-mobile. */
export function toAttributeName(prop) {
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** A prop value checked against its schema entry, or undefined when unusable. */
function normalize(value, spec) {
  if (value === undefined || value === null) return undefined;
  if (spec.type === 'boolean') return value !== false && value !== 'false';
  const text = String(value).trim();
  const resolved = (spec.aliases && spec.aliases[text]) || text;
  if (!resolved || (spec.values && !spec.values.includes(resolved))) return undefined;
  return resolved;
}

/**
 * Sets `props` on `element` as attributes, per `schema`. Props missing from
 * the schema, empty, or outside a prop's allowed values are skipped, leaving
 * the component's default; a boolean prop set to false removes its attribute.
 * @param {Element} element the primitive element
 * @param {object} props prop name → value
 * @param {object} schema the primitive's props schema (see above)
 * @returns {Element} the element
 */
export function applyProps(element, props, schema) {
  Object.entries(schema).forEach(([prop, spec]) => {
    const value = normalize(props[prop], spec);
    if (value === undefined) return;
    const attribute = spec.attribute || toAttributeName(prop);
    if (spec.type === 'boolean') element.toggleAttribute(attribute, value);
    else element.setAttribute(attribute, value);
  });
  return element;
}

/** Creates a `tag` element with `props` applied (see applyProps). */
export function createPrimitive(tag, props, schema) {
  return applyProps(document.createElement(tag), props, schema);
}

/**
 * Reads the props a block's authored options set, from its classes (the
 * classes_* fields of its model): `<option>-<value>` for string props,
 * `<option>` for boolean ones. Only props with an `option` are read.
 * @param {Element} block the block
 * @param {object} schema the primitive's props schema
 * @returns {object} prop name → value, for the options present
 */
export function propsFromClasses(block, schema) {
  const props = {};
  Object.entries(schema).forEach(([prop, spec]) => {
    if (!spec.option) return;
    if (spec.type === 'boolean') {
      if (block.classList.contains(spec.option)) props[prop] = true;
      return;
    }
    const choices = spec.optionValues
      || Object.fromEntries((spec.values || []).map((value) => [value, value]));
    const match = Object.keys(choices)
      .find((suffix) => block.classList.contains(`${spec.option}-${suffix}`));
    if (match) props[prop] = choices[match];
  });
  return props;
}

/**
 * The block's rows by field, for a model whose fields render one row each in
 * order, empty or not: `names[i]` → the cell holding row i's content.
 * @param {Element} block the block
 * @param {string[]} names the row field names, in model order
 * @returns {object} name → cell element (missing rows are left out)
 */
export function readRows(block, names) {
  const rows = {};
  [...block.children].forEach((row, index) => {
    if (!names[index]) return;
    rows[names[index]] = row.children.length === 1 ? row.firstElementChild : row;
  });
  return rows;
}

/** True when the block is being edited in the Universal Editor. */
export function isEditing(block) {
  return block.hasAttribute('data-aue-resource');
}
