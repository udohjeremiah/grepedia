import { useParams, useRouteContext } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { formatCompactNumber } from "@/utils/format-compact-number";
import { getInitials } from "@/utils/get-initials";

import { useToolComments } from "../-queries/tool-comments";
import { useToolSetCommentReaction } from "../-queries/tool-set-comment-reaction";
import ToolCommentReplies from "./tool-comment-replies";

type ToolCommentProps = ReturnType<typeof useToolComments>["data"][number];

export default function ToolComment(comment: ToolCommentProps) {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}/" });
  const {
    isPending,
    mutate: setCommentReaction,
    variables,
  } = useToolSetCommentReaction(slug, userId);

  const isAuthor = comment.user._id === userId;
  const hasUpvoted = comment.viewerReaction === 1;
  const hasDownvoted = comment.viewerReaction === -1;
  const isPendingForComment = isPending && variables?.commentId === comment._id;

  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage alt={comment.user.name} src={comment.user.image} />
        <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            @{comment.user.username}
          </span>
          {isAuthor && <Badge variant="info">Author</Badge>}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>
        <div className="flex flex-wrap items-center">
          <Button
            className={cn("text-muted-foreground", hasUpvoted && "text-info")}
            disabled={isPendingForComment}
            onClick={() =>
              setCommentReaction({ commentId: comment._id, value: 1 })
            }
            size="xs"
            variant="ghost"
          >
            <ThumbsUpIcon className={cn(hasUpvoted && "fill-current")} />
            {formatCompactNumber(comment.stats.upvotes)}
          </Button>
          <Button
            className={cn(
              "text-muted-foreground",
              hasDownvoted && "text-destructive",
            )}
            disabled={isPendingForComment}
            onClick={() =>
              setCommentReaction({ commentId: comment._id, value: -1 })
            }
            size="xs"
            variant="ghost"
          >
            <ThumbsDownIcon className={cn(hasDownvoted && "fill-current")} />
            {formatCompactNumber(comment.stats.downvotes)}
          </Button>
          <ToolCommentReplies comment={comment} slug={slug} />
        </div>
      </div>
    </div>
  );
}
