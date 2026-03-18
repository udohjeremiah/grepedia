import { Skeleton } from "@workspace/ui/components/skeleton";

export default function UserToolsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex w-full justify-between gap-4 max-sm:flex-col">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-72 max-sm:w-56" />
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-16 w-full rounded-xl" key={index} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex w-full justify-between gap-4 max-sm:flex-col">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-72 max-sm:w-56" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-52" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-24 w-full rounded-xl" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
