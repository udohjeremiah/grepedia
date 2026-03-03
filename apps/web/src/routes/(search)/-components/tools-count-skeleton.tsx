import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolsCountSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-16" />
    </div>
  );
}
