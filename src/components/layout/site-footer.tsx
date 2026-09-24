import Link from "next/link";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { companyNav, homeState, legalNav, otherStateSections } from "@/config/taxonomy";
import { BrandLogo } from "@/components/brand/brand-logo";
import { WhatsAppIcon } from "@/components/icons";
import { SocialLinks } from "./social-links";

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="t-kicker text-white/55">{title}</h2>
      <ul className="mt-3 space-y-0.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-9 items-center text-[0.9375rem] text-white/85 hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const jharkhandLinks = [
    { href: "/jharkhand", label: "Jharkhand" },
    ...(homeState.localities ?? []).slice(0, 6).map((l) => ({ href: `/jharkhand/${l.slug}`, label: l.name })),
  ];
  const stateLinks = [...otherStateSections.map((s) => ({ href: `/${s.slug}`, label: s.name })), { href: "/india", label: "India" }];
  const sectionLinks = [
    { href: "/latest", label: "Latest News" },
    { href: "/business", label: "Business" },
    { href: "/sports", label: "Sports" },
    { href: "/politics", label: "Politics" },
    { href: "/education", label: "Education" },
    { href: "/video", label: "Video" },
  ];

  return (
    <footer className="on-dark mt-16 bg-navy-950 text-white md:mt-20">
      <div className="container-page grid gap-10 py-12 md:py-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <BrandLogo variant="footer" className="h-16" />
          <p className="mt-4 font-serif text-xl text-white italic">{site.tagline}</p>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-white/70">
            A digital-first newsroom from Jharkhand, reporting on the region and the nation with accuracy, context and
            fairness.
          </p>
          <a
            href={whatsappLink(whatsappMessages.tip)}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex min-h-11 items-center gap-2.5 border border-white/25 px-4 text-sm font-semibold hover:border-white hover:bg-white/5"
          >
            <WhatsAppIcon size={18} className="text-whatsapp" />
            News tips: {site.contact.whatsappDisplay}
          </a>
          <SocialLinks className="mt-4 -ml-2.5 gap-1" size={20} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
          <FooterColumn title="Jharkhand" links={jharkhandLinks} />
          <FooterColumn title="States" links={stateLinks} />
          <FooterColumn title="Sections" links={sectionLinks} />
          <FooterColumn title="Anjaan Khabar" links={[...companyNav, ...legalNav]} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[0.8125rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>
            Spotted an error?{" "}
            <Link href="/corrections" className="text-white/80 underline hover:text-white">
              Request a correction
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
