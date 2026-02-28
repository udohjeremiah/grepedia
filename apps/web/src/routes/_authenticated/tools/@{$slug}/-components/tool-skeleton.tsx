import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[25%_minmax(0,1fr)] lg:grid-rows-none lg:gap-8">
        <Skeleton className="h-full w-80" />
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}
