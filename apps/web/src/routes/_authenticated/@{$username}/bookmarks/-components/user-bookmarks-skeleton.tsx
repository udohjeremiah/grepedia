import { Skeleton } from "@workspace/ui/components/skeleton";

export default function UserBookmarksSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <Skeleton className="h-100 w-full flex-1 rounded-lg" />
    </div>
  );
}
