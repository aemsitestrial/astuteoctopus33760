/*
 * Content Fragment GraphQL service
 * ---------------------------------
 * Reusable helper for fetching AEM Content Fragments via persisted GraphQL
 * queries. Any block backed by a Content Fragment can use this instead of
 * re-implementing endpoint resolution, URL building, and response digging.
 *
 * Environment-specific values (endpoint host, project/config name) are read
 * from /config.json (via getSiteConfig) so nothing is hardcoded in block code.
 *
 * Config keys (see /config.json):
 *   cf.graphql.endpoint   base URL of the persisted-query endpoint, without a
 *                         trailing slash. Empty => same-origin
 *                         '/graphql/execute.json'.
 *   cf.graphql.project    the {project} segment in
 *                         /graphql/execute.json/{project}/{queryName}.
 *
 * Usage:
 *   import { fetchPersistedQuery, getCfImageUrl } from '../../scripts/cf-graphql.js';
 *   const data = await fetchPersistedQuery('hero-by-path', { path: cfPath });
 *   const item = data?.heroByPath?.item;
 */

import { getSiteConfig } from './scripts.js';

/** Trim a value to a string, '' for non-strings/nullish. */
function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Resolves the persisted-query base URL and project name from site config.
 * @returns {Promise<{base: string, project: string}>}
 */
export async function getCfEndpoint() {
  const config = await getSiteConfig();
  const base = str(config['cf.graphql.endpoint']) || '/graphql/execute.json';
  const project = str(config['cf.graphql.project']);
  return { base, project };
}

/**
 * Resolves the AEM asset host used to prefix bare DAM image paths, from
 * config (cf.assets.host). Empty when not configured (paths left relative).
 * @returns {Promise<string>} absolute origin without trailing slash, or ''
 */
export async function getCfAssetHost() {
  const config = await getSiteConfig();
  return str(config['cf.assets.host']).replace(/\/+$/, '');
}

/**
 * Builds the fetch init (headers/credentials) for a CF GraphQL request from
 * config. Supports an optional Authorization header for protected endpoints
 * (e.g. an AEM author instance during local development):
 *   cf.graphql.authorization  full header value, e.g. "Basic YWRtaW46YWRtaW4=".
 * Kept in config (not hardcoded) so it is easy to omit for production, where
 * the request should target an unauthenticated publish tier instead.
 * @param {AbortSignal} [signal]
 * @returns {Promise<RequestInit>}
 */
export async function getCfRequestInit(signal) {
  const config = await getSiteConfig();
  const init = { signal };
  const authorization = str(config['cf.graphql.authorization']);
  if (authorization) {
    init.headers = { Authorization: authorization };
    // Needed so the browser sends credentials to a cross-origin AEM host.
    init.credentials = 'include';
  }
  return init;
}

/**
 * Builds a persisted-query request URL. Persisted-query parameters are
 * appended as `;name=value` segments (AEM convention), URL-encoded.
 * @param {string} base persisted-query endpoint base
 * @param {string} project project/config name
 * @param {string} queryName persisted query name
 * @param {Object} [params] query variables to append as ;name=value
 * @returns {string} the full request URL
 */
export function buildPersistedQueryUrl(base, project, queryName, params = {}) {
  // AEM's persisted-query endpoint expects literal '/' in parameter values
  // (e.g. path=/content/dam/...), not percent-encoded '%2F'. Encode other
  // unsafe characters but keep forward slashes intact.
  const encodeValue = (value) => encodeURIComponent(value).replace(/%2F/gi, '/');
  const segments = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([name, value]) => `;${encodeURIComponent(name)}=${encodeValue(value)}`)
    .join('');
  return `${base}/${project}/${queryName}${segments}`;
}

/**
 * Fetches a persisted GraphQL query and returns its `data` object.
 * Fully defensive: returns null on missing config, network error, non-OK
 * response, JSON parse failure, or GraphQL errors.
 * @param {string} queryName persisted query name (e.g. 'hero-by-path')
 * @param {Object} [params] query variables (e.g. { path: '/content/dam/...' })
 * @param {Object} [options] optional { signal } passthrough to fetch
 * @returns {Promise<Object|null>} the GraphQL `data` object, or null
 */
export async function fetchPersistedQuery(queryName, params = {}, options = {}) {
  const name = str(queryName);
  if (!name) return null;

  const { base, project } = await getCfEndpoint();
  if (!project) return null;

  const url = buildPersistedQueryUrl(base, project, name, params);

  try {
    const resp = await fetch(url, await getCfRequestInit(options.signal));
    if (!resp.ok) return null;
    const json = await resp.json();
    if (Array.isArray(json?.errors) && json.errors.length) return null;
    return json?.data && typeof json.data === 'object' ? json.data : null;
  } catch (e) {
    return null;
  }
}

/**
 * Convenience wrapper for the common "one fragment by path" pattern. Digs the
 * first `data.*` key so a differently-named query field still resolves, and
 * returns the single item (from `.item` or the first of `.items`).
 * @param {string} queryName persisted query name
 * @param {string} path the Content Fragment path
 * @param {Object} [options] optional { signal }
 * @returns {Promise<Object|null>} the fragment item, or null
 */
export async function fetchFragmentByPath(queryName, path, options = {}) {
  const cfPath = str(path);
  if (!cfPath) return null;

  const data = await fetchPersistedQuery(queryName, { path: cfPath }, options);
  if (!data) return null;

  const firstKey = Object.keys(data)[0];
  const payload = firstKey ? data[firstKey] : null;
  if (!payload || typeof payload !== 'object') return null;
  if (payload.item) return payload.item;
  if (Array.isArray(payload.items)) return payload.items[0] || null;
  return null;
}

/**
 * Resolves an AEM Content Fragment image field to a browser-loadable URL.
 *
 * GraphQL asset references arrive as a plain path string or an object exposing
 * _dynamicUrl / _publishUrl / url / _path. Resolution order:
 *   1. _dynamicUrl  — absolute, public Dynamic Media (Scene7) URL; CDN-served
 *                     and already optimized. Preferred when present.
 *   2. _publishUrl  — absolute publish delivery URL.
 *   3. a DAM path (_path / url / string) — a relative /content/dam/... path
 *      that does NOT resolve on the EDS page origin (that host does not serve
 *      DAM assets). Prefixed with `assetHost` (the AEM publish host) so the
 *      browser requests it from the right origin.
 *
 * @param {string|Object|null} image the CF image field value
 * @param {string} [assetHost] absolute origin to prefix bare DAM paths with
 *   (e.g. https://publish-pXXXX-eYYYY.adobeaemcloud.com), no trailing slash
 * @returns {string} a URL string, or '' when unresolved
 */
export function getCfImageUrl(image, assetHost = '') {
  /* eslint-disable no-underscore-dangle */
  let raw = '';
  if (typeof image === 'string') {
    raw = image;
  } else if (image && typeof image === 'object') {
    // Prefer the absolute, public Dynamic Media URL, then publish URL.
    if (image._dynamicUrl) return image._dynamicUrl;
    if (image._publishUrl) return image._publishUrl;
    raw = image.url || image._path || '';
  }
  /* eslint-enable no-underscore-dangle */

  raw = str(raw);
  if (!raw) return '';
  // Already absolute (http/https or protocol-relative): use as-is.
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  // Bare DAM path: prefix with the configured asset host so it loads from AEM.
  const host = str(assetHost).replace(/\/+$/, '');
  return host ? `${host}${raw.startsWith('/') ? '' : '/'}${raw}` : raw;
}
