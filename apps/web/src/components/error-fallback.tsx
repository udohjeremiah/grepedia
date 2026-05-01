import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { cn } from "@workspace/ui/lib/cn";
import { BugIcon } from "lucide-react";

interface ErrorFallbackProps {
  description: string;
  onRetry: () => void;
  title?: string;
  variant?: "compact" | "empty";
  wrapperClassName?: string;
}

export default function ErrorFallback({
  description,
  onRetry,
  title = "Something Went Wrong",
  variant = "empty",
  wrapperClassName,
}: ErrorFallbackProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col items-center", wrapperClassName)}>
        <p className="text-sm/relaxed">{description}</p>
        <Button
          className="w-full"
          onClick={onRetry}
          size="sm"
          variant="destructive"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BugIcon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="w-full" onClick={onRetry} variant="destructive">
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
