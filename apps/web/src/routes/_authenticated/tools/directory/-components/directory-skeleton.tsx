import { Skeleton } from "@workspace/ui/components/skeleton";

export default function DirectorySkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-[25%_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b px-3 py-2">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 p-3">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b px-4 py-2.5">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
