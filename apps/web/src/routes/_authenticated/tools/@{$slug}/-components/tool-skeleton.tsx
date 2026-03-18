import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
