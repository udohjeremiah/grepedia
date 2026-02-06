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
import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-1 p-4 sm:p-8 md:px-16">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BugIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Something Went Wrong</EmptyTitle>
          <EmptyDescription>
            Something unexpected happened, so we couldn&apos;t load the search
            results. Click the button below to try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="destructive"
            onClick={resetErrorBoundary}
            className="w-full"
          >
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
