import Link from "next/link";
import { getLocalityMeta, getSectionMeta } from "@/config/taxonomy";
import { formatRelative } from "@/lib/format";
import type { Article } from "@/lib/types";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/icons";

/* ------------------------------------------------------------------ labels */

export function articleKicker(a: Pick<Article, "section" | "locality">) {
  if (a.locality) return getLocalityMeta(a.section, a.locality)?.name ?? a.locality;
  return getSectionMeta(a.section)?.name ?? a.section;
}

const formatLabel: Partial<Record<Article["format"], string>> = {
  explainer: "Explained",
  analysis: "Analysis",
};

export function Kicker({
  article,
  tone = "red",
  className = "",
}: {
  article: Pick<Article, "section" | "locality" | "format" | "isDeveloping">;
  tone?: "red" | "muted" | "inverse";
  className?: string;
}) {
  const color = tone === "red" ? "text-red" : tone === "inverse" ? "text-gold" : "text-muted";
  const fmt = formatLabel[article.format];
  return (
    <p className={`t-kicker flex flex-wrap items-center gap-x-2 ${color} ${className}`}>
      {article.isDeveloping ? (
        <span className="inline-flex items-center gap-1.5 text-red">
          <span className="animate-live-dot size-1.5 rounded-full bg-red" aria-hidden />
          Developing
        </span>
      ) : null}
      <span>{articleKicker(article)}</span>
      {fmt ? <span className={tone === "inverse" ? "text-white/70" : "text-ink-2"}>· {fmt}</span> : null}
    </p>
  );
}

export function Timestamp({ iso, className = "", prefix }: { iso: string; className?: string; prefix?: string }) {
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {prefix ? `${prefix} ` : null}
      {formatRelative(iso)}
    </time>
  );
}

export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`t-kicker inline-flex items-center border border-current px-1.5 py-px text-[0.625rem] leading-4 tracking-[0.1em] ${className}`}
      title="Demonstration content — not a real news report"
    >
      Demo
    </span>
  );
}

/* ------------------------------------------------------------------ section header */

export function SectionHeader({
  title,
  href,
  linkLabel = "More",
  as: Tag = "h2",
  tone = "default",
  eyebrow,
  children,
  id,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
  tone?: "default" | "inverse";
  eyebrow?: string;
  children?: React.ReactNode;
  id?: string;
}) {
  const inverse = tone === "inverse";
  return (
    <div className={`mb-5 border-t-[3px] pt-3 md:mb-6 ${inverse ? "border-white" : "border-ink"}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className={`t-kicker mb-1 ${inverse ? "text-gold" : "text-red"}`}>{eyebrow}</p> : null}
          <Tag id={id} className={`t-section ${inverse ? "text-white" : "text-ink"}`}>
            {href ? (
              <Link href={href} className="hl-link">
                {title}
              </Link>
            ) : (
              title
            )}
          </Tag>
        </div>
        {href ? (
          <Link
            href={href}
            className={`group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold ${inverse ? "text-white/85 hover:text-white" : "text-cobalt hover:text-cobalt-700"}`}
          >
            {linkLabel}
            <span className="sr-only"> {title}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ buttons */

type BtnVariant = "primary" | "navy" | "outline" | "outline-inverse" | "ghost" | "whatsapp";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-red text-white hover:bg-red-700",
  navy: "bg-navy-900 text-white hover:bg-navy-800",
  outline: "border border-line-strong text-ink hover:border-ink",
  "outline-inverse": "border border-white/40 text-white hover:border-white hover:bg-white/5",
  ghost: "text-ink hover:bg-paper",
  whatsapp: "bg-navy-900 text-white hover:bg-navy-800 [&_svg]:text-whatsapp",
};

export function btn(variant: BtnVariant = "primary", size: "sm" | "md" | "lg" = "md") {
  const sizes = { sm: "min-h-9 px-3 text-sm", md: "min-h-11 px-4 text-[0.9375rem]", lg: "min-h-12 px-5 text-base" };
  return `inline-flex items-center justify-center gap-2 rounded-xs font-semibold transition-colors ${sizes[size]} ${btnVariants[variant]}`;
}

/* ------------------------------------------------------------------ empty state */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="t-h-md">{title}</p>
      {children ? <div className="t-dek mx-auto mt-2 max-w-md text-muted">{children}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ pagination */

export function Pagination({
  page,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const item = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 px-3 text-sm font-semibold";
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between border-t border-line pt-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${item} text-cobalt hover:bg-paper`} rel="prev">
          <ChevronLeft size={18} /> Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="t-meta">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={`${item} text-cobalt hover:bg-paper`} rel="next">
          Older <ChevronRight size={18} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ breadcrumbs */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, tone = "default" }: { items: Crumb[]; tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  return (
    <nav aria-label="Breadcrumb" className="t-meta">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight size={12} className={inverse ? "text-white/50" : "text-line-strong"} /> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className={`hover:underline ${inverse ? "text-white/75" : "text-muted"}`}>
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={inverse ? "text-white" : "text-ink-2"}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
