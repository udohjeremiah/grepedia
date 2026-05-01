import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { FlagIcon, UserRoundXIcon, WrenchIcon } from "lucide-react";
import { useState } from "react";

import { globalBannerStore } from "@/lib/global-banner-store";
import { getErrorMessage } from "@/utils/get-error-message";

import { useModeratorGetComment } from "../-queries/moderator-get-comment";
import { useModeratorGetTool } from "../-queries/moderator-get-tool";
import { useModeratorGetUser } from "../-queries/moderator-get-user";
import { CommentPanel } from "./comment-panel";
import { LookupBar } from "./lookup-bar";
import { ToolPanel } from "./tool-panel";
import { UserPanel } from "./user-panel";

type ModerationTarget = "comment" | "tool" | "user";

const emptyIconByTarget: Record<ModerationTarget, React.ReactNode> = {
  comment: <FlagIcon className="text-muted-foreground" />,
  tool: <WrenchIcon className="text-muted-foreground" />,
  user: <UserRoundXIcon className="text-muted-foreground" />,
};

const emptyIdentifierByTarget: Record<ModerationTarget, string> = {
  comment: "comment id",
  tool: "tool",
  user: "user",
};

export function Moderation() {
  const [target, setTarget] = useState<ModerationTarget>("user");
  const [identifier, setIdentifier] = useState("");

  const userLookup = useModeratorGetUser({ username: identifier });
  const toolLookup = useModeratorGetTool({ slug: identifier });
  const commentLookup = useModeratorGetComment({ commentId: identifier });

  const isFetching =
    userLookup.isFetching || toolLookup.isFetching || commentLookup.isFetching;

  const handleFetch = async () => {
    if (!identifier.trim()) return;

    try {
      switch (target) {
        case "comment": {
          const { data: comment } = await commentLookup.refetch();
          if (!comment) return;
          globalBannerStore.add({
            description: `Fetched comment ${comment._id} successfully.`,
            title: "Comment fetched",
            variant: "success",
          });
          break;
        }
        case "tool": {
          const { data: tool } = await toolLookup.refetch();
          if (!tool) return;
          globalBannerStore.add({
            description: `Fetched tool ${tool.slug} successfully.`,
            title: "Tool fetched",
            variant: "success",
          });
          break;
        }
        case "user": {
          const { data: user } = await userLookup.refetch();
          if (!user) return;
          globalBannerStore.add({
            description: `Fetched @${user.username} successfully.`,
            title: "User fetched",
            variant: "success",
          });
          break;
        }
        default: {
          throw new Error("Invalid target");
        }
      }
    } catch (error) {
      globalBannerStore.add({
        description: getErrorMessage(error),
        title: "Lookup failed",
        variant: "destructive",
      });
    }
  };

  const user = userLookup.data;
  const tool = toolLookup.data;
  const comment = commentLookup.data;

  return (
    <>
      <LookupBar
        identifier={identifier}
        isFetching={isFetching}
        onFetch={handleFetch}
        onIdentifierChange={(value) => setIdentifier(value)}
        onTargetChange={(value) => {
          setTarget(value);
          setIdentifier("");
        }}
        target={target}
      />
      {target === "user" && user && (
        <UserPanel identifier={identifier} user={user} />
      )}
      {target === "tool" && tool && (
        <ToolPanel identifier={identifier} tool={tool} />
      )}
      {target === "comment" && comment && (
        <CommentPanel comment={comment} identifier={identifier} />
      )}
      {!user && !tool && !comment && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">{emptyIconByTarget[target]}</EmptyMedia>
            <EmptyTitle>No {target} selected</EmptyTitle>
            <EmptyDescription>
              Enter a {emptyIdentifierByTarget[target]} and click fetch to view
              moderation actions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
