import Link from "next/link";
import { getAd } from "@/lib/data";
import type { AdPlacement, Advertisement } from "@/lib/types";
import { adsenseClient, placements } from "./ad-config";
import { AdSenseUnit } from "./adsense-unit";

/**
 * Reusable ad placement.
 *   1. A live direct / government / local campaign from the database, else
 *   2. Google AdSense (when configured), else
 *   3. A house ad promoting advertising with Anjaan Khabar.
 * The frame reserves its size up front, so ads never shift the page.
 */
export async function AdSlot({
  placement,
  className = "",
  band = false,
}: {
  placement: AdPlacement;
  className?: string;
  /** Wrap in a full-width tinted band with vertical padding (between homepage sections). */
  band?: boolean;
}) {
  const spec = placements[placement];
  const ad = await getAd(placement);

  const slot = (
    <aside
      aria-label="Advertisement"
      className={`${spec.hiddenOnMobile ? "hidden lg:block" : ""} ${className}`}
      data-ad-placement={placement}
    >
      <p className="mb-1.5 text-center font-sans text-[0.625rem] font-semibold tracking-[0.14em] text-muted uppercase">
        Advertisement{ad ? <span className="font-normal normal-case tracking-normal"> · {ad.advertiser}</span> : null}
      </p>
      <div className={`mx-auto w-full overflow-hidden ${spec.frameClass}`}>
        {ad ? (
          <DirectAd ad={ad} />
        ) : adsenseClient && spec.adsenseSlot ? (
          <AdSenseUnit client={adsenseClient} slot={spec.adsenseSlot} />
        ) : (
          <HouseAd placement={placement} />
        )}
      </div>
    </aside>
  );

  if (!band) return slot;
  return (
    <div className="border-y border-line bg-paper py-4 md:py-5">
      <div className="container-page">{slot}</div>
    </div>
  );
}

function DirectAd({ ad }: { ad: Advertisement }) {
  return (
    <a href={ad.href} target="_blank" rel="sponsored noopener" className="block size-full">
      <picture>
        {ad.mobileImage ? <source media="(max-width: 767px)" srcSet={ad.mobileImage.src} /> : null}
        {/* Plain <img>: art-directed creative served at its exact booked pixel size. */}
        <img
          src={ad.image.src}
          alt={ad.image.alt || `Advertisement: ${ad.advertiser}`}
          width={ad.image.width}
          height={ad.image.height}
          loading="lazy"
          className="size-full object-contain"
        />
      </picture>
    </a>
  );
}

/** Tasteful self-promotion used when no paid campaign is live. */
function HouseAd({ placement }: { placement: AdPlacement }) {
  const compact = placement === "leaderboard" || placement === "section-break" || placement === "footer";
  return (
    <Link
      href="/advertise"
      className={`group flex size-full items-center justify-center gap-x-6 gap-y-3 border border-line-strong bg-white px-4 text-center transition-colors hover:border-navy-700 ${
        compact ? "max-md:flex-col md:text-left" : "flex-col"
      }`}
    >
      <span className={`min-w-0 ${compact ? "md:flex md:items-baseline md:gap-3" : ""}`}>
        <span className="block font-serif text-[1.0625rem] leading-tight font-bold text-navy-900">
          Advertise with Anjaan Khabar
        </span>
        <span className={`t-meta block ${compact ? "max-md:hidden" : "mt-1"}`}>
          Reach readers across Jharkhand and eastern India.
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-cobalt group-hover:underline">View formats →</span>
    </Link>
  );
}
