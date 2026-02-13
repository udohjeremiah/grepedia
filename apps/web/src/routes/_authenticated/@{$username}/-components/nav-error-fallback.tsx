import type { FallbackProps } from "react-error-boundary";

import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { BugIcon } from "lucide-react";

export default function NavErrorFallback({
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="p-4 sm:px-8 md:px-0 md:py-6">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BugIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Something Went Wrong</EmptyTitle>
          <EmptyDescription>
            Something unexpected happened, so we couldn&apos;t load the
            navigation. Click the button below to try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            className="w-full"
            onClick={resetErrorBoundary}
            variant="destructive"
          >
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
