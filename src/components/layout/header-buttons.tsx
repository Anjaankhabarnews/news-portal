"use client";

import { MenuIcon, SearchIcon } from "@/components/icons";
import { openMenu, openSearch } from "./events";

export function SearchButton({ variant = "icon" }: { variant?: "icon" | "field" }) {
  if (variant === "field") {
    return (
      <button
        type="button"
        onClick={openSearch}
        className="on-dark flex h-10 w-56 items-center gap-2 rounded-xs border border-white/20 bg-white/5 px-3 text-left text-sm text-white/70 transition-colors hover:border-white/40 hover:bg-white/10 xl:w-64"
        aria-haspopup="dialog"
      >
        <SearchIcon size={17} />
        <span className="flex-1">Search news, places…</span>
        <kbd className="rounded-xs border border-white/25 px-1.5 font-sans text-[0.6875rem] text-white/60">/</kbd>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      className="on-dark grid size-11 place-items-center text-white hover:bg-white/10"
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
      className="on-dark grid size-11 place-items-center text-white hover:bg-white/10"
      aria-label="Open menu"
      aria-haspopup="dialog"
    >
      <MenuIcon size={23} />
    </button>
  );
}
