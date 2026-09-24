import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";
import { SocialLinks } from "@/components/layout/social-links";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description: `Contact the ${site.name} newsroom — news tips, corrections, advertising and general enquiries.`,
  path: "/contact",
});

const channels = [
  { title: "News tips", body: "Photos, videos or information about something happening near you.", message: whatsappMessages.tip, cta: "Send a tip", extra: { href: "/news-tip", label: "or use the online form" } },
  { title: "Corrections", body: "Seen an error in one of our stories? Tell us and we will review it promptly.", message: whatsappMessages.correction, cta: "Report an error", extra: { href: "/corrections", label: "corrections policy" } },
  { title: "Advertising", body: "Display, local business and public-sector campaigns across our site.", message: whatsappMessages.advertise, cta: "Advertising enquiry", extra: { href: "/advertise", label: "see ad formats" } },
  { title: "General enquiries", body: "Partnerships, feedback and everything else.", message: whatsappMessages.general, cta: "Message us" },
];

export default function ContactPage() {
  return (
    <InfoPage title="Contact Us" path="/contact" lede="The quickest way to reach the newsroom is WhatsApp.">
      <p>
        WhatsApp: <a href={whatsappLink()}>{site.contact.whatsappDisplay}</a>
        {site.contact.email ? (
          <>
            <br />
            Email: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </>
        ) : null}
        {site.contact.address ? (
          <>
            <br />
            Address: {site.contact.address}
          </>
        ) : null}
      </p>

      <div className="!mt-8 grid gap-px border border-line bg-line font-sans sm:grid-cols-2">
        {channels.map((c) => (
          <section key={c.title} className="bg-white p-5">
            <h2 className="!mt-0 !text-lg">{c.title}</h2>
            <p className="!mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{c.body}</p>
            <a
              href={whatsappLink(c.message)}
              target="_blank"
              rel="noopener"
              className="!mt-4 inline-flex min-h-11 items-center gap-2 bg-navy-900 px-4 text-sm font-semibold text-white !no-underline hover:bg-navy-800"
            >
              <WhatsAppIcon size={17} className="text-whatsapp" /> {c.cta}
            </a>
            {c.extra ? (
              <p className="!mt-2 text-sm">
                <Link href={c.extra.href}>{c.extra.label}</Link>
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <h2>Follow us</h2>
      <p>Our only official social media accounts are:</p>
      <SocialLinks className="-ml-2.5 gap-1 font-sans" itemClass="size-11 text-ink-2 hover:text-ink" size={22} />
      <p className="text-[0.9375rem] text-muted">
        {site.social.map((s) => `${s.label}: ${s.handle}`).join(" · ")}. Accounts using our name elsewhere are not operated by us.
      </p>
    </InfoPage>
  );
}
