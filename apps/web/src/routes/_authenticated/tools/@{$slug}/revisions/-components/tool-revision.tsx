import { useParams } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

import { auth } from "@/hooks/auth";
import { getErrorMessage } from "@/utils/get-error-message";
import { globalBanner } from "@/utils/global-banner";

import { useToolRevertRevision } from "../-queries/tool-revert-revision";
import { useToolRevisions } from "../-queries/tool-revisions";

type ToolRevisionProps = ReturnType<typeof useToolRevisions>["data"][number];

export default function ToolRevision(revision: ToolRevisionProps) {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });

  const [showSnapshot, setShowSnapshot] = useState(false);

  const { user } = auth.useSession();
  const { isPending: isReverting, mutate: revertRevision } =
    useToolRevertRevision(slug);

  function handleRevert() {
    revertRevision(
      {
        revisionId: revision._id,
        summary: `Restore the tool listing to the state from revision #${revision.revisionNumber}.`,
        title: `Revert to revision #${revision.revisionNumber}`,
      },
      {
        onError: (error) => {
          globalBanner.emit({
            banner: {
              description: getErrorMessage(error),
              title: "Couldn't revert revision",
              variant: "destructive",
            },
            type: "add",
          });
        },
        onSuccess: () => {
          globalBanner.emit({
            banner: {
              description: `Tool was reverted to revision #${revision.revisionNumber}.`,
              title: "Revision reverted",
              variant: "success",
            },
            type: "add",
          });
        },
      },
    );
  }

  const canRevert = user?.status === "active" && user.role === "moderator";

  return (
    <div className="flex items-start">
      <div className="mt-3 mr-5 flex w-18.75 shrink-0 flex-col gap-2 text-end sm:w-22.5">
        <h6 className="text-sm font-semibold text-primary">
          v{revision.revisionNumber} {revision.isRevert && " (revert)"}
        </h6>
        <span className="text-xs text-muted-foreground sm:text-sm">
          {format(new Date(revision.createdAt), "yyyy-MM-dd")}
        </span>
      </div>
      <div className="relative min-w-0 space-y-2 border-l-2 pb-10 pl-6 group-last:pb-4 sm:pl-8">
        <div className="absolute top-4 -left-px h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background" />
        <div className="mt-2 flex flex-col tracking-[-0.01em]">
          <h4 className="truncate text-lg font-semibold">{revision.title}</h4>
          <p className="text-sm text-muted-foreground">
            by @{revision.createdBy} ·{" "}
            {formatDistanceToNow(new Date(revision.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <p className="text-sm whitespace-break-spaces sm:text-base">
          {revision.summary}
        </p>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSnapshot((previous) => !previous)}
            size="xs"
            variant="outline"
          >
            {showSnapshot ? "Hide snapshot" : "View snapshot"}
          </Button>
          {canRevert && (
            <Button
              disabled={isReverting}
              onClick={() => handleRevert()}
              size="xs"
              variant="outline"
            >
              {isReverting ? <Spinner /> : "Revert"}
            </Button>
          )}
        </div>
        {showSnapshot && (
          <pre className="max-h-48 overflow-auto rounded-md border bg-card p-4 font-mono text-xs whitespace-break-spaces">
            {JSON.stringify(revision.snapshot, undefined, 2)}
          </pre>
        )}
        {revision.linkedDiscussionUrl && (
          <a
            className="block truncate text-sm text-primary underline underline-offset-4"
            href={revision.linkedDiscussionUrl}
            rel="noreferrer"
            target="_blank"
          >
            {revision.linkedDiscussionUrl}
          </a>
        )}
      </div>
    </div>
  );
}
