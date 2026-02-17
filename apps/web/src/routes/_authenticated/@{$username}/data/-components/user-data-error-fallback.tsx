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

export default function UserDataErrorFallback({
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BugIcon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Something Went Wrong</EmptyTitle>
        <EmptyDescription>
          Something unexpected happened, so we couldn&apos;t load the user
          recovery package. Click the button below to try again.
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
  );
}
