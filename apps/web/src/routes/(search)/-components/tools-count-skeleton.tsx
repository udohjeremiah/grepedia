import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolsCountSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-56" />
    </div>
  );
}
