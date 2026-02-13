import { Skeleton } from "@workspace/ui/components/skeleton";

import { navItems } from "./nav";

export default function NavSkeleton() {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto border-b p-2 sm:px-6 md:flex-col md:border-none md:px-0 md:py-6">
      {navItems.map((_, index) => (
        <Skeleton className="h-9 w-full rounded-lg" key={index} />
      ))}
    </div>
  );
}
