import Link from "next/link";
import { whatsappLink, whatsappMessages } from "@/config/site";
import { homeState } from "@/config/taxonomy";
import { BrandLogo } from "@/components/brand/brand-logo";
import { WhatsAppIcon } from "@/components/icons";
import { MenuButton, SearchButton } from "./header-buttons";
import { MobileDrawer } from "./mobile-drawer";
import { MobileRail } from "./mobile-rail";
import { PrimaryNav } from "./primary-nav";
import { SearchDialog } from "./search-dialog";
import { SocialLinks } from "./social-links";
import { TodayDate } from "./today-date";

/**
 * Header stack — built around the official logo, which is designed for white:
 *   Desktop (≥1024): navy utility strip → white brand bar (logo as hero) → sticky navy nav
 *   Mobile/tablet:   sticky white bar (logo · search · WhatsApp · menu) → navy section rail
 * `display: contents` keeps one banner landmark while letting children stick to the page.
 */
export function SiteHeader() {
  const localities = homeState.localities ?? [];
  return (
    <header className="contents">
      {/* ---------- Desktop utility strip */}
      <div className="on-dark hidden bg-navy-950 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.8125rem]">
          <p className="font-medium text-white/80">
            <TodayDate />
          </p>
          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-5 text-white/75">
              <li>
                <Link href="/latest" className="hover:text-white">
                  Latest
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-white">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
            <span className="h-4 w-px bg-white/20" aria-hidden />
            <SocialLinks className="-mr-2" size={16} itemClass="size-8 text-white/70 hover:text-white" />
          </div>
        </div>
      </div>

      {/* ---------- Desktop brand bar: the logo leads */}
      <div className="hidden border-b border-line bg-white lg:block">
        <div className="container-page flex items-center gap-8 py-3">
          <BrandLogo className="-ml-2.5 h-[5.25rem] xl:h-[5.75rem]" sizes="(min-width: 1280px) 256px, 234px" priority />
          <div className="ml-auto flex items-center gap-3">
            <SearchButton variant="field" />
            <a
              href={whatsappLink(whatsappMessages.tip)}
              target="_blank"
              rel="noopener"
              className="flex h-11 items-center gap-2 rounded-xs bg-red px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <WhatsAppIcon size={18} />
              Send a News Tip
            </a>
          </div>
        </div>
      </div>

      <PrimaryNav localities={localities} compactLogo={<BrandLogo variant="mobile" className="h-8" sizes="90px" plate />} />

      {/* ---------- Mobile / tablet sticky bar */}
      <div className="sticky top-0 z-40 border-b border-line bg-white/97 backdrop-blur-sm lg:hidden">
        <div className="flex h-[var(--header-mobile-h)] items-center pr-1.5 pl-[calc(var(--gutter)-6px)]">
          <BrandLogo variant="mobile" className="h-14" sizes="160px" priority />
          <div className="ml-auto flex items-center">
            <SearchButton />
            <a
              href={whatsappLink(whatsappMessages.tip)}
              target="_blank"
              rel="noopener"
              className="grid size-11 place-items-center rounded-full text-success hover:bg-paper"
              aria-label="Send a news tip on WhatsApp (opens in new tab)"
            >
              <WhatsAppIcon size={22} />
            </a>
            <MenuButton />
          </div>
        </div>
      </div>
      <MobileRail />

      <MobileDrawer localities={localities} logo={<BrandLogo variant="mobile" className="h-12" sizes="150px" />} />
      <SearchDialog />
    </header>
  );
}
