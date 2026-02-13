import type { FallbackProps } from "react-error-boundary";

import { Button } from "@workspace/ui/components/button";

export default function ToolsCountErrorFallback({
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm/relaxed">Couldn&apos;t load tools count.</p>
      <Button
        className="w-full"
        onClick={resetErrorBoundary}
        size="sm"
        variant="destructive"
      >
        Try again
      </Button>
    </div>
  );
}
