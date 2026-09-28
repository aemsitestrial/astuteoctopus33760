// scripts/ignite/dist/utils/focus-trap.js
var FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
function getFocusableEls(root) {
  const results = [];
  const walkEl = (el) => {
    if (el.tagName === "SLOT") {
      el.assignedElements({ flatten: true }).forEach(walkEl);
      return;
    }
    if (el.shadowRoot) {
      Array.from(el.shadowRoot.children).forEach(walkEl);
    } else {
      if (el.matches(FOCUSABLE) && !results.includes(el)) {
        results.push(el);
      }
      Array.from(el.children).forEach(walkEl);
    }
  };
  Array.from(root.children).forEach(walkEl);
  return results;
}
function handleFocusTrap(e, root) {
  if (e.key !== "Tab")
    return;
  const focusable = getFocusableEls(root);
  if (!focusable.length)
    return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = e.composedPath().find((n) => focusable.includes(n));
  if (e.shiftKey && (active === first || !active)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !active)) {
    e.preventDefault();
    first.focus();
  }
}
export {
  getFocusableEls,
  handleFocusTrap
};
