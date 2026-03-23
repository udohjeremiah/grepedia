import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolsSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-2.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
