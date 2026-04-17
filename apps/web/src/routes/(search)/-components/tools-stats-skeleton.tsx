import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ToolsStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="flex flex-col items-center gap-1" key={index}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
