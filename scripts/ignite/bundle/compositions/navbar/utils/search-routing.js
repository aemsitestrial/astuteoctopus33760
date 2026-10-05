// scripts/ignite/dist/compositions/navbar/utils/search-routing.js
var SEARCH_EXPANDED_WIDTH = 280;
var SEARCH_COLLAPSED_WIDTH = 48;
var SEARCH_NET_GROWTH = SEARCH_EXPANDED_WIDTH - SEARCH_COLLAPSED_WIDTH;
function getOccupiedWidth(navbarEl) {
  const PADDING = 64;
  const GAP = 32;
  const children = Array.from(navbarEl.children);
  const visibleChildren = children.filter((el) => el.offsetWidth > 0);
  const childrenWidth = visibleChildren.reduce((sum, el) => sum + el.offsetWidth, 0);
  const gapWidth = Math.max(0, visibleChildren.length - 1) * GAP;
  return PADDING + childrenWidth + gapWidth;
}
function getSearchAvailableGrowth(shadowRoot) {
  const navbarEl = shadowRoot.querySelector(".navbar");
  if (!navbarEl)
    return null;
  return navbarEl.offsetWidth - getOccupiedWidth(navbarEl);
}
function shouldOpenDelegate(shadowRoot) {
  const available = getSearchAvailableGrowth(shadowRoot);
  if (available === null)
    return null;
  return available < SEARCH_NET_GROWTH;
}
function shouldTransferWhileOpen(shadowRoot) {
  const navbarEl = shadowRoot.querySelector(".navbar");
  if (!navbarEl)
    return false;
  return getOccupiedWidth(navbarEl) > navbarEl.offsetWidth;
}
function shouldTransferToInline(shadowRoot) {
  const available = getSearchAvailableGrowth(shadowRoot);
  if (available === null)
    return false;
  return available >= SEARCH_NET_GROWTH;
}
function getSearchBar(shadowRoot) {
  const searchSlot = shadowRoot.querySelector('slot[name="search"]');
  if (!searchSlot)
    return null;
  for (const el of searchSlot.assignedElements({ flatten: true })) {
    const found = el.tagName.toLowerCase() === "xe-search-bar" ? el : el.querySelector("xe-search-bar");
    if (found)
      return found;
  }
  return null;
}
export {
  getSearchAvailableGrowth,
  getSearchBar,
  shouldOpenDelegate,
  shouldTransferToInline,
  shouldTransferWhileOpen
};
