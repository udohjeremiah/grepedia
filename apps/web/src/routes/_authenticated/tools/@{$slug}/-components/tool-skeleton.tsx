import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolSkeleton() {
  return (
    <div className="flex flex-1 p-4 sm:px-8 md:px-16">
      <div className="flex flex-1 flex-col gap-8">
        <Skeleton className="h-34 w-full rounded-lg" />
        <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_25%] lg:grid-rows-none lg:gap-8">
          <div className="lg:order-2">
            <Skeleton className="h-115 w-full rounded-lg" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-115 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
