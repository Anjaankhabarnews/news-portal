import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";
import { btn } from "@/components/ui/primitives";

/** Citizen-journalism call to action. Used on the homepage and at the end of articles. */
export function TipCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`border-l-4 border-red bg-paper ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className={`flex flex-col gap-5 ${compact ? "" : "md:flex-row md:items-center md:justify-between md:gap-10"}`}>
        <div className="max-w-2xl">
          <p className="t-kicker text-red">Citizen reporting</p>
          <h2 className={`mt-1 font-serif font-bold text-ink ${compact ? "text-xl" : "text-2xl md:text-[1.75rem]"} leading-tight`}>
            Seen something that should be reported?
          </h2>
          <p className="t-dek mt-2">
            Send photos, videos or details to the {site.name} newsroom. We verify every tip before publishing and protect our
            sources.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 xs:flex-row">
          <a href={whatsappLink(whatsappMessages.tip)} target="_blank" rel="noopener" className={btn("whatsapp", "lg")}>
            <WhatsAppIcon size={20} /> WhatsApp {site.contact.whatsappDisplay}
          </a>
          <Link href="/news-tip" className={btn("outline", "lg")}>
            Online form
          </Link>
        </div>
      </div>
    </div>
  );
}
