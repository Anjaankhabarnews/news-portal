import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { WhatsAppIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/ui/primitives";
import { TipForm } from "./tip-form";

export const metadata: Metadata = buildMetadata({
  title: "Send Us a News Tip",
  description: "Share news, photos or videos with the Anjaan Khabar newsroom on WhatsApp or through our secure online form.",
  path: "/news-tip",
});

export default function NewsTipPage() {
  // Only a boolean reaches the client — never the key itself.
  const uploadsEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="container-page pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Send a News Tip" }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="t-kicker text-red">Citizen reporting</p>
          <h1 className="t-h1 mt-1">Send us a news tip</h1>
          <p className="t-dek mt-3 max-w-2xl text-lg">
            Something happening in your area that people should know about? Tell our newsroom. Every tip is checked by an editor before
            anything is published.
          </p>

          <div className="mt-8">
            <TipForm uploadsEnabled={uploadsEnabled} />
          </div>
        </div>

        <aside className="lg:col-span-5" aria-label="Other ways to reach the newsroom">
          <div className="on-dark bg-navy-900 p-6 text-white md:p-8 lg:sticky lg:top-20">
            <p className="t-kicker text-gold">Fastest way</p>
            <h2 className="mt-1 font-serif text-2xl font-bold">WhatsApp the newsroom</h2>
            <p className="mt-2 text-white/75">Send text, photos, videos or voice notes directly to our editors.</p>
            <a href={whatsappLink(whatsappMessages.tip)} target="_blank" rel="noopener" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 bg-white px-5 font-semibold text-navy-900 hover:bg-white/90">
              <WhatsAppIcon size={20} className="text-success" /> {site.contact.whatsappDisplay}
            </a>

            <h3 className="mt-8 t-kicker text-white/60">How we handle tips</h3>
            <ul className="mt-3 space-y-3 text-[0.9375rem] text-white/85">
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 bg-red" aria-hidden />
                We verify independently before publishing — a tip alone is never a story.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 bg-red" aria-hidden />
                Your name and number stay private unless you agree otherwise.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 bg-red" aria-hidden />
                <span>
                  If you are in danger, contact emergency services on <strong>112</strong> first.
                </span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-white/60">
              Read our{" "}
              <Link href="/editorial-policy" className="underline hover:text-white">
                editorial policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-white">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
