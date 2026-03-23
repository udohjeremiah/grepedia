import { Skeleton } from "@workspace/ui/components/skeleton";

export default function CategoriesSkeleton() {
  return (
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
  );
}
