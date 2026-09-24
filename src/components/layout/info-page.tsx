import Link from "next/link";
import { site } from "@/config/site";
import { companyNav, legalNav } from "@/config/taxonomy";
import { formatDate } from "@/lib/format";
import { InfoIcon } from "@/components/icons";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/primitives";

const LEGAL_PATHS = ["/privacy", "/terms", "/cookies"];

/** Shared layout for About / Contact / Advertise / policies — the same publication, every page. */
export function InfoPage({
  title,
  lede,
  path,
  kicker = site.name,
  isPolicy = false,
  children,
}: {
  title: string;
  lede?: string;
  path: string;
  kicker?: string;
  isPolicy?: boolean;
  children: React.ReactNode;
}) {
  const crumbs = [{ label: "Home", href: "/" }, { label: title, href: path }];
  return (
    <div className="container-page pt-5 md:pt-7">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <p className="t-kicker text-red">{kicker}</p>
          <h1 className="t-h1 mt-1">{title}</h1>
          {lede ? <p className="mt-3 font-serif text-[1.1875rem] leading-snug text-ink-2 md:text-[1.375rem]">{lede}</p> : null}
          {isPolicy ? (
            <p className="t-meta mt-4">
              Last updated <time dateTime={site.policiesUpdated}>{formatDate(site.policiesUpdated)}</time>
            </p>
          ) : null}
          {LEGAL_PATHS.includes(path) && !site.legalReviewed ? (
            <p className="mt-5 flex gap-3 border border-gold/60 bg-gold/10 p-4 text-[0.9375rem] text-ink-2">
              <InfoIcon size={18} className="mt-0.5 shrink-0 text-ink" />
              This policy is a working draft and is pending legal review. It will be finalised before launch.
            </p>
          ) : null}
          <div className="prose-article mt-8">{children}</div>
        </div>

        <aside className="lg:col-span-4" aria-label={`About ${site.name}`}>
          <nav aria-label="Company and policies" className="border-t-[3px] border-ink pt-3 lg:sticky lg:top-20">
            <p className="t-section">{site.name}</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {[...companyNav, ...legalNav, { href: "/news-tip", label: "Send a News Tip" }].map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={n.href === path ? "page" : undefined}
                    className={`flex min-h-11 items-center text-[0.9375rem] hover:text-red ${n.href === path ? "font-semibold text-red" : "text-ink-2"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
