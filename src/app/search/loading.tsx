import { ListSkeleton } from "@/components/ui/skeletons";

export default function SearchLoading() {
  return (
    <div className="container-page pt-6 md:pt-10">
      <div className="skeleton h-10 w-40" aria-hidden />
      <div className="skeleton mt-5 h-14 w-full" aria-hidden />
      <div className="mt-8 max-w-4xl">
        <ListSkeleton rows={5} label="Searching" />
      </div>
    </div>
  );
}
