"use client";

import { MenuIcon, SearchIcon } from "@/components/icons";
import { openMenu, openSearch } from "./events";

/** Search trigger: a field-style button on the desktop brand bar, an icon on mobile. */
export function SearchButton({ variant = "icon" }: { variant?: "icon" | "field" }) {
  if (variant === "field") {
    return (
      <button
        type="button"
        onClick={openSearch}
        className="flex h-11 w-60 items-center gap-2.5 rounded-xs border border-line-strong bg-paper px-3.5 text-left text-sm text-muted transition-colors hover:border-navy-700 hover:bg-white xl:w-72"
        aria-haspopup="dialog"
      >
        <SearchIcon size={18} className="text-navy-700" />
        <span className="flex-1">Search news, places…</span>
        <kbd className="rounded-xs border border-line-strong bg-white px-1.5 font-sans text-[0.6875rem] text-muted">/</kbd>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-paper"
      aria-label="Search"
      aria-haspopup="dialog"
    >
      <SearchIcon size={21} />
    </button>
  );
}

export function MenuButton() {
  return (
    <button
      type="button"
      onClick={openMenu}
      className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-paper"
      aria-label="Open menu"
      aria-haspopup="dialog"
    >
      <MenuIcon size={24} />
    </button>
  );
}
