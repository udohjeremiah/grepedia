import { useParams } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { formatDistanceToNow } from "date-fns";

import { auth } from "@/hooks/auth";

import { useToolProposals } from "../-queries/tool-proposals";
import { ToolModeratorDialog } from "./tool-moderator-dialog";

export function ToolProposals() {
  const { slug } = useParams({ from: "/tools/@{$slug}" });

  const { user } = auth.useSession();
  const { data: proposals } = useToolProposals({ slug });

  const canReview = user?.status === "active" && user?.role === "moderator";

  const proposalList = [
    proposals?.updateCase && {
      description: proposals.updateCase.title,
      discussionUrl: proposals.updateCase.discussionUrl,
      id: proposals.updateCase._id,
      proposal: proposals.updateCase,
      requestedAt: proposals.updateCase.requestedAt,
      status: proposals.updateCase.status,
      type: "update" as const,
      username: proposals.updateCase.requester.username,
    },
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (proposalList.length === 0) return;

  return (
    <section className="flex flex-col gap-4">
      {proposalList.map((item) => (
        <div className="flex flex-col gap-2 border p-3" key={item.id}>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="warning">{item.status.replace("_", " ")}</Badge>
                <p className="text-sm font-medium">Tool Update</p>
              </div>
              <p className="text-xs text-muted-foreground">
                by @{item.username} ·{" "}
                {formatDistanceToNow(new Date(item.requestedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {canReview && (
              <ToolModeratorDialog currentStatus={item.status} id={item.id} />
            )}
          </div>
          <p className="text-sm">{item.description}</p>
          {item.discussionUrl && (
            <a
              className="w-fit text-xs text-primary underline underline-offset-4"
              href={item.discussionUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open update discussion
            </a>
          )}
        </div>
      ))}
    </section>
  );
}
