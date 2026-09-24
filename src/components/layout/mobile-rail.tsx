"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { mobileRailNav } from "@/config/taxonomy";

/**
 * Mobile/tablet section rail: one-thumb horizontal scroll, Jharkhand first.
 * The active chip scrolls into view on navigation.
 */
export function MobileRail() {
  const pathname = usePathname() ?? "/";
  const railRef = useRef<HTMLUListElement>(null);

  let active = "";
  for (const n of mobileRailNav) {
    const match = n.href === "/" ? pathname === "/" : pathname === n.href || pathname.startsWith(`${n.href}/`);
    if (match && n.href.length > active.length) active = n.href;
  }

  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="Sections" className="relative border-b border-line bg-white lg:hidden">
      <ul ref={railRef} className="scroll-rail flex items-center gap-1 px-[calc(var(--gutter)-8px)]">
        {mobileRailNav.map((n) => {
          const isActive = n.href === active;
          return (
            <li key={n.href} className="shrink-0">
              <Link
                href={n.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-11 items-center px-2 text-[0.9375rem] font-semibold whitespace-nowrap ${
                  isActive ? "text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-red" : "text-ink-2"
                }`}
              >
                {n.label}
              </Link>
            </li>
          );
        })}
        <li className="w-2 shrink-0" aria-hidden />
      </ul>
      <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white" aria-hidden />
    </nav>
  );
}
