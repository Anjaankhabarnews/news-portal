/** Small shared UI pieces for the newsroom dashboard. */

export const field =
  "mt-1.5 block w-full rounded-xs border border-line-strong bg-white px-3 text-[0.9375rem] text-ink placeholder:text-muted focus:border-cobalt focus:outline-none";

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block font-semibold text-ink">
      {children}
      {hint ? <span className="ml-1 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-white p-4 md:p-5 ${className}`}>
      {title ? <h2 className="mb-4 font-sans text-xs font-extrabold tracking-[0.12em] text-muted uppercase">{title}</h2> : null}
      {children}
    </section>
  );
}

export function PageTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-serif text-2xl font-bold text-ink md:text-[1.75rem]">{children}</h1>
      {action}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const cls =
    tone === "error"
      ? "border-red bg-red-50 text-ink"
      : tone === "success"
        ? "border-success bg-paper text-ink"
        : "border-cobalt bg-cobalt-50 text-cobalt-700";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`border-l-4 px-4 py-3 text-[0.9375rem] ${cls}`}>
      {children}
    </p>
  );
}

export const btnPrimary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-red px-4 font-semibold text-white hover:bg-red-700 disabled:opacity-60";
export const btnNavy = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xs bg-navy-900 px-4 font-semibold text-white hover:bg-navy-800 disabled:opacity-60";
export const btnOutline =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xs border border-line-strong bg-white px-4 font-semibold text-ink hover:border-ink disabled:opacity-60";

export type StoryStatus = "draft" | "pending_review" | "scheduled" | "published" | "archived";

export function statusOf(status: StoryStatus, publishedAt: string | null): { label: string; cls: string } {
  if (status === "published" && publishedAt && new Date(publishedAt) > new Date())
    return { label: "Scheduled", cls: "bg-cobalt-50 text-cobalt-700" };
  switch (status) {
    case "published":
      return { label: "Published", cls: "bg-[#e7f5ec] text-success" };
    case "pending_review":
      return { label: "Needs review", cls: "bg-gold/20 text-ink" };
    case "archived":
      return { label: "Archived", cls: "bg-line text-muted" };
    case "scheduled":
      return { label: "Scheduled", cls: "bg-cobalt-50 text-cobalt-700" };
    default:
      return { label: "Draft", cls: "bg-paper text-ink-2 border border-line-strong" };
  }
}

export function StatusBadge({ status, publishedAt }: { status: StoryStatus; publishedAt: string | null }) {
  const s = statusOf(status, publishedAt);
  return <span className={`inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

const dt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const fmt = (iso: string | null | undefined) => (iso ? dt.format(new Date(iso)) : "—");
