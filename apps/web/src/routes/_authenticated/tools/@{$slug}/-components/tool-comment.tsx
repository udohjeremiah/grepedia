import { useParams, useRouteContext } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/utils/cn";
import { formatDistanceToNow } from "date-fns";
import {
  FlagIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useState } from "react";

import { MarkdownEditor, MarkdownPreview } from "@/components/markdown";
import { env } from "@/env";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getInitials } from "@/utils/get-initials";

import { useToolComments } from "../-queries/tool-comments";
import { useToolSetCommentReaction } from "../-queries/tool-set-comment-reaction";
import { useToolUpdateComment } from "../-queries/tool-update-comment";
import ToolCommentReplies from "./tool-comment-replies";

type ToolCommentProps = ReturnType<typeof useToolComments>["data"][number];

export default function ToolComment(comment: ToolCommentProps) {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const {
    isPending,
    mutate: setCommentReaction,
    variables,
  } = useToolSetCommentReaction(slug, comment.parentCommentId);
  const { isPending: isUpdating, mutate: updateComment } =
    useToolUpdateComment(slug);

  const handleSaveEdit = () => {
    const content = draft.trim();
    if (!content || content === comment.content) {
      setIsEditing(false);
      setDraft(comment.content);
      return;
    }

    updateComment(
      { commentId: comment._id, content },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const isAuthor = comment.user._id === userId;
  const isEdited =
    new Date(comment.updatedAt).getTime() >
    new Date(comment.createdAt).getTime();
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
        <div className="flex justify-between gap-2">
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
            {isEdited && (
              <span className="text-xs text-muted-foreground">edited</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-xs" variant="ghost">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor && (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild variant="destructive">
                <a
                  href={env.VITE_DISCORD_REPORT_COMMENT_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FlagIcon />
                  Report
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <MarkdownEditor
              onChange={(value = "") => {
                if (value.length > 5000) return;
                setDraft(value);
              }}
              textareaProps={{
                maxLength: 5000,
                minLength: 1,
                placeholder: "Update your comment...",
                required: true,
              }}
              value={draft}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setDraft(comment.content);
                }}
                size="xs"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdating || draft.trim().length === 0}
                onClick={handleSaveEdit}
                size="xs"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <MarkdownPreview source={comment.content} />
        )}
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
