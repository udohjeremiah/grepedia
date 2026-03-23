import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolCommentsSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex items-center gap-0.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  );
}
