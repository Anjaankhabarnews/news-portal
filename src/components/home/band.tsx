/** Full-width background band with a centred editorial container. Provides the page's vertical rhythm. */
export function Band({
  tone = "plain",
  children,
  className = "",
  labelledBy,
}: {
  tone?: "plain" | "paper" | "navy";
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const bg = tone === "navy" ? "on-dark bg-navy-900 text-white" : tone === "paper" ? "bg-paper" : "bg-white";
  const pad = tone === "plain" ? "py-8 md:py-10" : "py-9 md:py-12";
  return (
    <section aria-labelledby={labelledBy} className={`${bg} ${pad} ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}
