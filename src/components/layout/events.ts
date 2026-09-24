/** Tiny cross-component signals for header controls rendered in several places. */
export const OPEN_SEARCH = "ak:open-search";
export const OPEN_MENU = "ak:open-menu";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH));
}

export function openMenu() {
  window.dispatchEvent(new Event(OPEN_MENU));
}
