"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { moreNav, primaryNav } from "@/config/taxonomy";
import type { Locality } from "@/lib/types";
import { ChevronDown, SearchIcon } from "@/components/icons";
import { openSearch } from "./events";

type MenuId = "jharkhand" | "more";

/** Longest matching nav href wins, so /jharkhand/ranchi highlights "Ranchi", not "Jharkhand". */
function useActiveHref(hrefs: string[]) {
  const pathname = usePathname() ?? "/";
  let best = "";
  for (const h of hrefs) {
    const match = h === "/" ? pathname === "/" : pathname === h || pathname.startsWith(`${h}/`);
    if (match && h.length > best.length) best = h;
  }
  return best;
}

/**
 * Desktop primary navigation (≥1024px). Sticky; once the brand bar scrolls
 * away a compact logo and search button slide in so the bar stays useful
 * without taking more vertical space.
 */
export function PrimaryNav({ compactLogo, localities }: { compactLogo: React.ReactNode; localities: Locality[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<MenuId | null>(null);
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const active = useActiveHref([...primaryNav.map((n) => n.href), ...moreNav.map((n) => n.href)]);
  const moreActive = moreNav.some((n) => n.href === active);

  // Close menus on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const featured = localities.filter((l) => l.featured);
  const districts = localities.filter((l) => !l.featured);

  const itemBase =
    "relative flex h-12 items-center gap-1 px-2 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:transition-colors xl:px-2.5 xl:after:inset-x-2.5";
  const itemState = (isActive: boolean) =>
    isActive ? "text-ink after:bg-red" : "text-ink-2 after:bg-transparent hover:text-ink hover:after:bg-line-strong";

  return (
    <>
      <div ref={sentinel} className="hidden h-px lg:block" aria-hidden />
      <nav
        ref={navRef}
        aria-label="Primary"
        className="sticky top-0 z-40 hidden border-b border-line bg-white/97 backdrop-blur-sm lg:block"
        onMouseLeave={() => setOpen(null)}
      >
        <div className="container-page flex items-center">
          {/* Compact logo only where there is room for it (≥1280px). */}
          <div
            className={`hidden shrink-0 items-center overflow-hidden transition-[width,opacity,margin] duration-200 xl:flex ${stuck ? "mr-3 w-auto opacity-100" : "w-0 opacity-0"}`}
            aria-hidden={!stuck}
            inert={!stuck}
          >
            {compactLogo}
          </div>

          <ul className="-ml-2 flex min-w-0 flex-1 items-center xl:-ml-2.5">
            {primaryNav.map((item) => {
              const isActive = active === item.href;
              if (item.hasMenu) {
                return (
                  <li key={item.href} className="flex items-center" onMouseEnter={() => setOpen("jharkhand")}>
                    <Link href={item.href} className={`${itemBase} pr-1 ${itemState(isActive)}`} aria-current={isActive ? "page" : undefined}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="grid h-12 w-6 place-items-center text-muted hover:text-ink"
                      aria-expanded={open === "jharkhand"}
                      aria-controls="menu-jharkhand"
                      aria-label="Jharkhand districts"
                      onClick={() => setOpen(open === "jharkhand" ? null : "jharkhand")}
                    >
                      <ChevronDown size={16} className={`transition-transform ${open === "jharkhand" ? "rotate-180" : ""}`} />
                    </button>
                  </li>
                );
              }
              return (
                <li key={item.href} className={item.wideOnly ? "hidden xl:block" : ""} onMouseEnter={() => setOpen(null)}>
                  <Link href={item.href} className={`${itemBase} ${itemState(isActive)}`} aria-current={isActive ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="relative" onMouseEnter={() => setOpen("more")}>
              <button
                type="button"
                className={`${itemBase} ${itemState(moreActive)}`}
                aria-expanded={open === "more"}
                aria-controls="menu-more"
                onClick={() => setOpen(open === "more" ? null : "more")}
              >
                More <ChevronDown size={16} className={`transition-transform ${open === "more" ? "rotate-180" : ""}`} />
              </button>
              {open === "more" ? (
                <div id="menu-more" className="animate-fade-in absolute top-full right-0 z-50 w-56 border border-line bg-white py-2 shadow-menu">
                  <ul>
                    {moreNav.map((m) => (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          className={`block px-4 py-2.5 text-[0.9375rem] font-medium hover:bg-paper ${active === m.href ? "text-red" : "text-ink"}`}
                        >
                          {m.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          </ul>

          <button
            type="button"
            onClick={openSearch}
            className={`grid size-10 shrink-0 place-items-center text-ink-2 transition-opacity hover:text-ink ${stuck ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-label="Search"
            tabIndex={stuck ? 0 : -1}
          >
            <SearchIcon size={19} />
          </button>
        </div>

        {open === "jharkhand" ? (
          <div id="menu-jharkhand" className="animate-fade-in absolute inset-x-0 top-full z-50 border-y border-line bg-white shadow-menu">
            <div className="container-page grid grid-cols-12 gap-8 py-6">
              <div className="col-span-4 border-r border-line pr-8">
                <p className="t-kicker text-red">Our home state</p>
                <Link href="/jharkhand" className="hl-link mt-1 block font-serif text-2xl font-bold text-ink">
                  Jharkhand
                </Link>
                <ul className="mt-4 space-y-1">
                  {featured.map((l) => (
                    <li key={l.slug}>
                      <Link href={`/jharkhand/${l.slug}`} className="group flex items-baseline justify-between gap-3 py-1.5">
                        <span className="font-serif text-lg font-semibold text-ink group-hover:underline">{l.name}</span>
                        <span className="t-meta text-xs">{l.type === "city" ? l.district : "Capital"}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-8">
                <p className="t-kicker mb-3 text-muted">Districts</p>
                <ul className="grid grid-cols-4 gap-x-6 gap-y-1">
                  {districts.map((l) => (
                    <li key={l.slug}>
                      <Link href={`/jharkhand/${l.slug}`} className="block py-1 text-[0.9375rem] text-ink-2 hover:text-red hover:underline">
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </>
  );
}
