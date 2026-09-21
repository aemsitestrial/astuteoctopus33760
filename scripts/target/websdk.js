/*
 * WebSDK (alloy) bootstrap + datastream configuration.
 */

// --- Datastream configuration ------------------------------------------------

export const WEBSDK_CONFIG = {
  datastreamId: 'd7e718aa-3cf8-429f-bc60-9921cdbed6cc',
  orgId: '0CEB60F754C7E06B0A4C98A2@AdobeOrg',
};

export const JSON_CONTENT_ITEM_SCHEMA = 'https://ns.adobe.com/personalization/json-content-item';

// --- WebSDK (alloy) bootstrap ------------------------------------------------

export function initWebSDK(path, config) {
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
