"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { OPEN_SEARCH } from "./events";

const quickLinks = [
  { href: "/jharkhand/jamshedpur", label: "Jamshedpur" },
  { href: "/jharkhand/ranchi", label: "Ranchi" },
  { href: "/jharkhand", label: "Jharkhand" },
  { href: "/india", label: "India" },
  { href: "/business", label: "Business" },
  { href: "/sports", label: "Sports" },
  { href: "/video", label: "Video" },
];

/** Global search modal. Opens from any search button or the "/" key. */
export function SearchDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  useEffect(() => {
    const open = () => {
      ref.current?.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if (e.key === "/" && !typing && !ref.current?.open) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener(OPEN_SEARCH, open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_SEARCH, open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="ak-modal bg-white shadow-dialog"
      aria-label="Search"
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <form
        role="search"
        action="/search"
        onSubmit={(e) => {
          e.preventDefault();
          const term = q.trim();
          if (!term) return;
          router.push(`/search?q=${encodeURIComponent(term)}`);
        }}
        className="flex items-center gap-2 border-b-2 border-ink px-4 md:px-6"
      >
        <SearchIcon size={22} className="shrink-0 text-muted" />
        <label htmlFor="global-search" className="sr-only">
          Search news
        </label>
        <input
          ref={inputRef}
          id="global-search"
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stories, places, topics"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={120}
          className="h-16 min-w-0 flex-1 bg-transparent font-serif text-xl text-ink placeholder:text-muted focus:outline-none md:h-20 md:text-2xl"
        />
        <button type="button" onClick={close} className="grid size-11 shrink-0 place-items-center text-ink-2 hover:bg-paper" aria-label="Close search">
          <CloseIcon size={22} />
        </button>
      </form>
      <div className="px-4 py-5 md:px-6">
        <p className="t-kicker text-muted">Browse</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-10 items-center border border-line-strong px-3 text-sm font-semibold text-ink-2 hover:border-ink hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="t-meta mt-5 hidden md:block">
          Press <kbd className="border border-line-strong px-1 text-xs">Enter</kbd> to search ·{" "}
          <kbd className="border border-line-strong px-1 text-xs">Esc</kbd> to close
        </p>
      </div>
    </dialog>
  );
}
