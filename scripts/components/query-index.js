/*
 * The site's query index (/query-index.json): every published page with the
 * properties the index is configured to extract (path, lastModified and
 * robots by default; title, description … once added in the Index Admin tool).
 * Previewed-only pages are never in the index.
 */

const PAGE_SIZE = 500;

let entriesPromise;

/**
 * Fetches all index entries, paging through the sheet, once per page load.
 * Resolves to an empty list if the index can't be loaded.
 * @returns {Promise<object[]>} the index rows, e.g. `{ path, title, robots }`
 */
export default function fetchQueryIndex() {
  if (!entriesPromise) {
    entriesPromise = (async () => {
      const entries = [];
      for (let offset = 0; ;) {
        // The sheet is paginated; each page depends on the previous offset.
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(`/query-index.json?offset=${offset}&limit=${PAGE_SIZE}`);
        if (!resp.ok) break;
        // eslint-disable-next-line no-await-in-loop
        const { data = [], total = 0 } = await resp.json();
        entries.push(...data);
        offset += data.length;
        if (!data.length || offset >= total) break;
      }
      return entries;
    })().catch(() => []);
  }
  return entriesPromise;
}
