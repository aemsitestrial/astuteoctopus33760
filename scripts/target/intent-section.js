/*
 * Intent Section personalization.
 *
 * An Intent Section (models/_intent-section.json) is a top-level section that
 * carries an authored `id`. Two kinds of decision scope are derived from it:
 *
 *  - a per-SECTION scope named after the section id — the offer is a `blocks`
 *    composite listing the blocks inside that section to personalize; and
 *  - a per-BLOCK scope named after each child block's auto-generated id
 *    (`<section-id>-<block>[-n]`, stamped by decorateIntentSectionBlockIds in
 *    scripts.js) — the offer is a flat field set applied to that one block.
 *
 * Both are discovered from the decorated page at request time, so adding an
 * Intent Section (or a personalizable block inside one) needs no code change.
 */

import { applyFields, applyInstructions } from './dom.js';
import { INTENT_SECTION_BLOCKS } from './fields.js';

// Top-level Intent Sections on the page. Only the intent-section model
// (models/_intent-section.json) exposes an `id` field, so a top-level section
// carrying an `id` attribute is definitionally an Intent Section
// (decorateSectionIds in scripts.js promotes the authored id to a real id
// attribute). Read after decoration.
export function getIntentSections() {
  const main = document.querySelector('main');
  return main ? [...main.querySelectorAll(':scope > .section[id]')] : [];
}

// --- Per-section scope --------------------------------------------------------

// Normalises `blocks` (array of single-key objects, or a name→fields map) into
// a flat list of [blockName, fields] entries.
function toBlockEntries(blocks) {
  if (Array.isArray(blocks)) {
    return blocks
      .filter((entry) => entry && typeof entry === 'object')
      .flatMap((entry) => Object.entries(entry));
  }
  if (blocks && typeof blocks === 'object') return Object.entries(blocks);
  return [];
}

// Resolves one `blocks` entry key to a { block, fields } pair within a section.
// The key is either:
//   - a block-name / alias in INTENT_SECTION_BLOCKS (e.g. "hero", "hero-v3") →
//     the FIRST instance of that block in the section, or
//   - an auto-generated child-block id (decorateIntentSectionBlockIds in
//     scripts.js: "<section>-<block>-<iteration>", e.g. "hero-intent-hero-v3-2")
//     → that specific block instance. The field map is looked up from the
//     resolved block's own data-block-name so a full id addresses one iteration.
function resolveSectionBlock(section, key) {
  const spec = INTENT_SECTION_BLOCKS[key];
  if (spec) return { block: section.querySelector(spec.selector), fields: spec.fields };
  // Treat the key as a generated block id (sits directly on the block element).
  // Scope to this section so an id from another section is never matched.
  const block = document.getElementById(key);
  if (!block || !section.contains(block)) return { block: null, fields: null };
  const byName = INTENT_SECTION_BLOCKS[block.dataset.blockName];
  return { block, fields: byName ? byName.fields : null };
}

// Applies a `blocks` composite to the blocks inside one section. Returns true
// only when every listed block applied; an unknown/unpersonalizable block name,
// an id that resolves to no personalizable block, or a not-yet-decorated block
// yields false, so the scope keeps retrying.
function applyBlocksToSection(section, blocks) {
  const entries = toBlockEntries(blocks);
  if (!section || !entries.length) return false;
  const applied = entries.filter(([key, fields]) => {
    const { block, fields: fieldMap } = resolveSectionBlock(section, key);
    if (!block || !fieldMap) return false; // not personalizable / not found
    return applyFields(block, fields, fieldMap);
  }).length;
  return applied === entries.length;
}

// Handler for a per-section decision scope: the scope name IS the section id
// (from getSectionScopes), so the offer only carries `blocks` (or a bare blocks
// array) — no id/name needed inside it.
export function sectionScopeHandler(scopeName) {
  return (content) => applyBlocksToSection(
    getIntentSections().find((s) => s.id === scopeName) || null,
    Array.isArray(content) ? content : content.blocks,
  );
}

// Each Intent Section id is offered to Target as its own decision scope, so an
// author points a Target activity at scope = the section id and ships a
// blocks-only offer.
export function getSectionScopes() {
  return getIntentSections().map((s) => s.id).filter(Boolean);
}

// --- Per-block scope ----------------------------------------------------------

// Ids of every personalizable, id-bearing block inside an Intent Section. Read
// after decoration (decorateBlocks populates data-block-name;
// decorateIntentSectionBlockIds populates the id). Only blocks whose
// data-block-name has a field map in INTENT_SECTION_BLOCKS are exposed, since
// those are the blocks a handler can actually personalize.
export function getIntentSectionBlockScopes() {
  return getIntentSections()
    .flatMap((section) => [...section.querySelectorAll(':scope .block[id][data-block-name]')])
    .filter((block) => INTENT_SECTION_BLOCKS[block.dataset.blockName])
    .map((block) => block.id)
    .filter(Boolean);
}

// Handler for a per-block decision scope: the scope name IS the block's
// generated id. Resolves that block, confirms it lives in an Intent Section,
// looks up its field map from data-block-name, and applies a flat field offer
// (bare fields, `set`, or an `items` array) directly to it — the block-level
// analogue of sectionScopeHandler.
export function intentSectionBlockScopeHandler(scopeName) {
  return (content) => {
    const block = document.getElementById(scopeName);
    if (!block) return false;
    // Guard against a same-id element outside any Intent Section.
    const section = block.closest('.section[id]');
    if (!section || !getIntentSections().includes(section)) return false;
    const spec = INTENT_SECTION_BLOCKS[block.dataset.blockName];
    if (!spec) return false;
    // The scope already identifies the exact block, so `match` is irrelevant;
    // applyInstructions still accepts bare fields / `set` / `items` shapes.
    return applyInstructions(content, (match, set) => applyFields(block, set, spec.fields));
  };
}
