import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
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
 * Header stack
 *   Desktop (≥1024): utility bar → navy brand bar → sticky primary nav
 *   Mobile/tablet:   sticky navy bar (logo · search · WhatsApp · menu) → section rail
 * `display: contents` keeps one banner landmark while letting children stick to the page.
 */
export function SiteHeader() {
  const localities = homeState.localities ?? [];
  return (
    <header className="contents">
      {/* ---------- Desktop utility bar */}
      <div className="hidden border-b border-line bg-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.8125rem]">
          <p className="font-medium text-ink-2">
            <TodayDate />
          </p>
          <ul className="flex items-center gap-5 text-ink-2">
            <li>
              <Link href="/news-tip" className="font-semibold text-red hover:underline">
                Send a News Tip
              </Link>
            </li>
            <li>
              <Link href="/advertise" className="hover:text-ink hover:underline">
                Advertise
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- Desktop brand bar */}
      <div className="hidden bg-navy-900 text-white lg:block">
        <div className="container-page flex h-[5.5rem] items-center gap-6">
          <BrandLogo className="h-[4.25rem]" priority />
          <p className="hidden border-l border-white/20 pl-5 font-serif text-lg text-white/85 italic xl:block">{site.tagline}</p>
          <div className="ml-auto flex items-center gap-3">
            <SearchButton variant="field" />
            <a
              href={whatsappLink(whatsappMessages.tip)}
              target="_blank"
              rel="noopener"
              className="on-dark flex h-10 items-center gap-2 rounded-xs bg-white/10 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <WhatsAppIcon size={18} className="text-whatsapp" />
              News Tip
            </a>
            <SocialLinks className="-mr-2 on-dark" />
          </div>
        </div>
      </div>

      <PrimaryNav localities={localities} compactLogo={<BrandLogo variant="mobile" className="h-9" />} />

      {/* ---------- Mobile / tablet sticky bar */}
      <div className="sticky top-0 z-40 bg-navy-900 text-white lg:hidden">
        <div className="flex h-[var(--header-mobile-h)] items-center pr-1 pl-[var(--gutter)]">
          <BrandLogo variant="mobile" className="h-10" priority />
          <div className="ml-auto flex items-center">
            <SearchButton />
            <a
              href={whatsappLink(whatsappMessages.tip)}
              target="_blank"
              rel="noopener"
              className="on-dark grid size-11 place-items-center text-whatsapp hover:bg-white/10"
              aria-label="Send a news tip on WhatsApp (opens in new tab)"
            >
              <WhatsAppIcon size={21} />
            </a>
            <MenuButton />
          </div>
        </div>
      </div>
      <MobileRail />

      <MobileDrawer localities={localities} />
      <SearchDialog />
    </header>
  );
}
