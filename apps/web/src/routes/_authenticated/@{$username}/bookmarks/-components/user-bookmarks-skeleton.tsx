import { Skeleton } from "@workspace/ui/components/skeleton";

export default function UserBookmarksSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-lg border p-6">
      <div className="flex gap-4">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="rounded-xl border p-4" key={index}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-[70%]" />
                <Skeleton className="h-4 w-full max-w-[90%]" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <Skeleton className="size-8 shrink-0 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
