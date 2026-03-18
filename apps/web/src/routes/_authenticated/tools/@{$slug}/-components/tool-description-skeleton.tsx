import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolDescriptionSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
      </div>
    </div>
  );
}
