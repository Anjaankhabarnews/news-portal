"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { companyNav, legalNav, moreNav, otherStateSections } from "@/config/taxonomy";
import type { Locality } from "@/lib/types";
import { ChevronDown, CloseIcon, SearchIcon, WhatsAppIcon } from "@/components/icons";
import { OPEN_MENU, openSearch } from "./events";
import { SocialLinks } from "./social-links";

/**
 * Mobile menu as a native modal <dialog> (focus trap, Esc, inert background for free).
 * Sections are grouped so the drawer never becomes a 20-item dump.
 */
export function MobileDrawer({ localities, logo }: { localities: Locality[]; logo: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [districtsOpen, setDistrictsOpen] = useState(false);

  useEffect(() => {
    const open = () => ref.current?.showModal();
    window.addEventListener(OPEN_MENU, open);
    return () => window.removeEventListener(OPEN_MENU, open);
  }, []);

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  // Lock page scroll while open.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const sync = () => document.documentElement.style.setProperty("overflow", d.open ? "hidden" : "");
    const mo = new MutationObserver(sync);
    mo.observe(d, { attributes: true, attributeFilter: ["open"] });
    return () => mo.disconnect();
  }, []);

  const close = () => ref.current?.close();
  const featured = localities.filter((l) => l.featured);
  const districts = localities.filter((l) => !l.featured);

  const row = "flex min-h-12 items-center justify-between px-5 text-[1.0625rem] font-semibold text-ink hover:bg-paper";
  const groupTitle = "t-kicker px-5 pt-5 pb-2 text-muted";

  return (
    <dialog
      ref={ref}
      className="ak-drawer bg-white"
      aria-label="Menu"
      onClick={(e) => {
        if (e.target === ref.current) close(); // backdrop click
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[var(--header-mobile-h)] shrink-0 items-center justify-between border-b-[3px] border-red bg-white pl-[calc(var(--gutter)-6px)] pr-1.5">
          {logo}
          <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-paper" aria-label="Close menu">
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
          <div className="px-5 pt-4">
            <button
              type="button"
              onClick={() => {
                close();
                openSearch();
              }}
              className="flex h-12 w-full items-center gap-3 border border-line-strong px-4 text-left text-muted"
            >
              <SearchIcon size={19} /> Search Anjaan Khabar
            </button>
          </div>

          <p className={groupTitle}>Jharkhand</p>
          <ul>
            <li>
              <Link href="/jharkhand" className={row}>
                Jharkhand <span className="t-meta text-xs font-normal">All state news</span>
              </Link>
            </li>
            {featured.map((l) => (
              <li key={l.slug}>
                <Link href={`/jharkhand/${l.slug}`} className={row}>
                  {l.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={`${row} w-full`}
                aria-expanded={districtsOpen}
                aria-controls="drawer-districts"
                onClick={() => setDistrictsOpen((v) => !v)}
              >
                All districts
                <ChevronDown size={18} className={`text-muted transition-transform ${districtsOpen ? "rotate-180" : ""}`} />
              </button>
              <ul id="drawer-districts" hidden={!districtsOpen} className="grid grid-cols-2 gap-x-4 bg-paper px-5 py-3">
                {districts.map((l) => (
                  <li key={l.slug}>
                    <Link href={`/jharkhand/${l.slug}`} className="block py-2 text-[0.9375rem] text-ink-2">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          <p className={groupTitle}>States</p>
          <ul>
            {otherStateSections.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className={row}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className={groupTitle}>India &amp; Topics</p>
          <ul className="grid grid-cols-2">
            {[
              { href: "/india", label: "India" },
              { href: "/business", label: "Business" },
              { href: "/sports", label: "Sports" },
              { href: "/video", label: "Video" },
              ...moreNav,
            ].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={row}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mx-5 mt-6 bg-navy-900 p-5 text-white">
            <p className="font-serif text-lg font-bold">Seen something newsworthy?</p>
            <p className="mt-1 text-sm text-white/75">Send a tip to the Anjaan Khabar newsroom.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={whatsappLink(whatsappMessages.tip)}
                target="_blank"
                rel="noopener"
                className="on-dark flex min-h-11 items-center justify-center gap-2 bg-white text-sm font-semibold text-navy-900"
              >
                <WhatsAppIcon size={18} className="text-success" /> WhatsApp
              </a>
              <Link href="/news-tip" className="on-dark flex min-h-11 items-center justify-center border border-white/40 text-sm font-semibold">
                Online form
              </Link>
            </div>
          </div>

          <p className={groupTitle}>{site.name}</p>
          <ul>
            {[...companyNav, ...legalNav].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex min-h-11 items-center px-5 text-[0.9375rem] text-ink-2 hover:bg-paper">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>

          <SocialLinks className="mt-4 gap-1 px-3" itemClass="size-11 text-ink-2 hover:text-ink" size={20} />
        </div>
      </div>
    </dialog>
  );
}
