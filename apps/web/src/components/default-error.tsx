import { Link } from "@tanstack/react-router";
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

export default function DefaultError() {
  return (
    <div
      role="alert"
      className="flex h-svh flex-col items-center justify-center p-6 md:p-10"
    >
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BugIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Something Went Wrong</EmptyTitle>
          <EmptyDescription>
            An unexpected error occurred while loading this page. Please refresh
            the page, or return home if the problem persists.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
