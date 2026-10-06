/*
 * Storybook stories for the XE Multi block (a composite multi-field sample).
 *
 * The model (blocks/xe-multi/_xe-multi.json) renders two rows:
 *
 *   heading  text                               -> "heading"
 *   links    container, multi: true             -> "links" ([text, url] pairs)
 *            linkText (Text) + link (URL) collapse into one <a> per item
 *
 * `fieldsToRows` renders the list markup AEM produces for items that collapse
 * into one element (<ul><li><a>…</a></li>…</ul>); the FlatList story covers
 * the <hr>-separated markup used for items that don't.
 */
import { expect, waitFor } from 'storybook/test';
import decorate from './xe-multi.js';
import { renderBlock } from '../../.storybook/eds.js';

const LINKS = [
  ['Pay Bill', '/pay-bill'],
  ['Report an Outage', '/outages-safety/outage-map'],
  ['Xcel Energy Newsroom', 'https://newsroom.xcelenergy.com'],
];

const list = (links) => (links.length
  ? `<ul>${links.map(([text, url]) => `<li><a href="${url}">${text}</a></li>`).join('')}</ul>`
  : '');

const fieldsToRows = (args) => [
  [args.heading ? `<p>${args.heading}</p>` : ''],
  [list(args.links)],
];

const render = (args, decorator = decorate) => renderBlock({
  name: 'xe-multi', rows: fieldsToRows(args), decorate: decorator,
});

export default {
  title: 'Blocks/XE Multi',
  args: { heading: 'Helpful Links', links: LINKS },
  argTypes: {
    heading: { control: 'text', description: 'Heading (text).' },
    links: { control: 'object', description: 'Links (composite multi-field): [Text, URL] pairs.' },
  },
  render: (args) => render(args),
};

/** The rendered links as [text, href, link-type] triples, once upgraded. */
async function renderedLinks(canvasElement) {
  const links = [...canvasElement.querySelectorAll('.xe-multi-links > li > xe-hyperlink')];
  await waitFor(() => expect(links.every((link) => link.shadowRoot?.querySelector('a'))).toBe(true), { timeout: 8000 });
  return links.map((link) => [link.textContent, link.getAttribute('href'), link.getAttribute('link-type')]);
}

// Each Text + URL item renders as an Ignite hyperlink in a list.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('h2.xe-multi-heading')).toHaveTextContent('Helpful Links');
    await expect(await renderedLinks(canvasElement)).toEqual([
      ['Pay Bill', '/pay-bill', 'internal'],
      ['Report an Outage', '/outages-safety/outage-map', 'internal'],
      ['Xcel Energy Newsroom', 'https://newsroom.xcelenergy.com', 'external'],
    ]);
    // External links open in a new window and say so to screen readers.
    const external = canvasElement.querySelector('xe-hyperlink[link-type="external"]');
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external.shadowRoot.querySelector('a')).toHaveAttribute('aria-label', 'Xcel Energy Newsroom (opens in a new window)');
  },
};

// Items that don't collapse into one element render as a flat list separated
// by <hr>; they're read the same way.
export const FlatList = {
  render: () => renderBlock({
    name: 'xe-multi',
    rows: [
      ['<p>Helpful Links</p>'],
      ['<p><a href="/pay-bill">Pay Bill</a></p><hr><p><a href="/outages-safety/outage-map">Report an Outage</a></p>'],
    ],
    decorate,
  }),
  play: async ({ canvasElement }) => {
    await expect(await renderedLinks(canvasElement)).toEqual([
      ['Pay Bill', '/pay-bill', 'internal'],
      ['Report an Outage', '/outages-safety/outage-map', 'internal'],
    ]);
  },
};

// No heading: just the links.
export const NoHeading = {
  args: { heading: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.xe-multi-heading')).toBeNull();
    await expect(await renderedLinks(canvasElement)).toHaveLength(3);
  },
};

// No links yet (or multi-fields not enabled for the program): nothing renders
// on a published page…
export const Empty = {
  args: { links: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.xe-multi-links')).toBeNull();
    await expect(canvasElement.querySelector('.xe-multi-placeholder')).toBeNull();
  },
};

// …and an editor-only placeholder in the Universal Editor.
export const EditorEmpty = {
  args: { links: [] },
  render: (args) => render(args, (block) => {
    block.setAttribute('data-aue-resource', 'urn:aemconnection:/content/xcel/index/jcr:content/root/section/xe_multi');
    return decorate(block);
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.xe-multi-placeholder')).toHaveTextContent('Add links (Text and URL)');
  },
};
