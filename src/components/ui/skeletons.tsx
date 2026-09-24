/** Loading skeletons that mirror real layouts, so content settles without jumping. */

export function StoryRowSkeleton() {
  return (
    <div className="flex gap-4 py-5" aria-hidden>
      <div className="flex-1 space-y-2.5">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-5 w-11/12" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-24" />
      </div>
      <div className="skeleton aspect-[4/3] w-24 shrink-0 sm:w-40" />
    </div>
  );
}

export function ListSkeleton({ rows = 5, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="divide-y divide-line">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <StoryRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="grid gap-8 lg:grid-cols-12" aria-hidden>
        <div className="space-y-4 lg:col-span-8">
          <div className="skeleton aspect-video w-full" />
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-9 w-11/12" />
          <div className="skeleton h-9 w-2/3" />
          <div className="skeleton h-4 w-full" />
        </div>
        <div className="lg:col-span-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2 border-b border-line py-4">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
