import { Suspense } from "react";

import { ToolComments } from "./tool-comments";
import { ToolDescription } from "./tool-description";

export function Tool() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <ToolDescription />
      </Suspense>
      <Suspense>
        <ToolComments />
      </Suspense>
    </div>
  );
}
