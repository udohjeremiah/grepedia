import { Skeleton } from "@workspace/ui/components/skeleton";

export default function LeaderboardSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden">
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Skeleton className="h-9 w-28 shrink-0 rounded-lg sm:w-40" />
          <Skeleton className="h-9 w-28 shrink-0 rounded-lg sm:w-40" />
          <Skeleton className="h-9 w-28 shrink-0 rounded-lg sm:w-40" />
        </div>
        <Skeleton className="h-3 w-full max-w-xl" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center gap-3 px-3">
        <Skeleton className="h-4 w-9" />
        <Skeleton className="h-4 flex-1" />
        <div className="hidden w-72 grid-cols-3 justify-items-end gap-6 sm:grid">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-16 sm:hidden" />
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="flex min-w-0 gap-3 rounded-lg p-3" key={index}>
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 max-w-[40%]" />
                <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full max-w-44" />
              <Skeleton className="h-3 w-24 sm:hidden" />
            </div>
            <div className="hidden w-72 grid-cols-3 justify-items-end gap-6 sm:grid">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
