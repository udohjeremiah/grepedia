import { useParams } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { FileStackIcon } from "lucide-react";

import { useToolRevisions } from "../-queries/tool-revisions";
import ToolRevision from "./tool-revision";

export default function ToolRevisions() {
  const { slug } = useParams({ from: "/tools/@{$slug}" });

  const {
    data: revisions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useToolRevisions({ slug });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold">Revision Timeline</h3>
        <p className="text-sm text-muted-foreground">
          View the complete history of updates to this tool, including who made
          each change and when.
        </p>
      </div>
      {revisions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <ul className="relative">
            {revisions.map((revision) => (
              <li className="group relative" key={revision._id}>
                <ToolRevision {...revision} />
              </li>
            ))}
          </ul>
          {hasNextPage && (
            <>
              <Separator />
              <Button
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                size="sm"
                variant="outline"
              >
                {isFetchingNextPage ? "Loading..." : "Load More Revisions"}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileStackIcon className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No revision history yet</EmptyTitle>
            <EmptyDescription>
              This tool hasn&apos;t received any updates yet. Revisions will
              appear here when changes are made.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
