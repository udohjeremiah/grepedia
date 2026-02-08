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
import { MehIcon } from "lucide-react";

export default function DefaultNotFound() {
  return (
    <div
      className="flex h-svh flex-col items-center justify-center p-6 md:p-10"
      role="alert"
    >
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MehIcon className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Oops! Page Not Found</EmptyTitle>
          <EmptyDescription>
            We can&apos;t seem to find the page you&apos;re looking for. This
            might be because the page was moved, deleted, or you typed the
            address incorrectly.
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
