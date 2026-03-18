import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolRevisionsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-3 rounded-md border p-3 sm:p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>
      <Skeleton className="h-9 w-40 rounded-md" />
    </div>
  );
}
