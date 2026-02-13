import { Skeleton } from "@workspace/ui/components/skeleton";

export default function UserDetailsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Skeleton className="h-80 w-full rounded-lg" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}
