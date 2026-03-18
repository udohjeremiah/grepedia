import { Suspense } from "react";

import ToolComments from "./tool-comments";
import ToolCommentsSkeleton from "./tool-comments-skeleton";
import ToolDescription from "./tool-description";
import ToolDescriptionSkeleton from "./tool-description-skeleton";

export default function Tool() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<ToolDescriptionSkeleton />}>
        <ToolDescription />
      </Suspense>
      <Suspense fallback={<ToolCommentsSkeleton />}>
        <ToolComments />
      </Suspense>
    </div>
  );
}
