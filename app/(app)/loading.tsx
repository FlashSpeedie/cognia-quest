import { SkeletonBlock } from "@/components/ui/EmptyState";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <div className="flex gap-4">
        <SkeletonBlock className="h-10 w-40" />
        <SkeletonBlock className="h-10 flex-1" />
      </div>
      <SkeletonBlock className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-52" />
        <SkeletonBlock className="h-52" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
