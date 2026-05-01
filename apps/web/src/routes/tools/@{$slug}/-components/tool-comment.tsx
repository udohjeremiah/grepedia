import { useParams } from "@tanstack/react-router";
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
import { cn } from "@workspace/ui/lib/cn";
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
import { auth } from "@/hooks/auth";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { globalBannerStore } from "@/lib/global-banner-store";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getAvatar } from "@/utils/get-avatar";
import { getInitials } from "@/utils/get-initials";

import { useToolComments } from "../-queries/tool-comments";
import { useToolSetCommentReaction } from "../-queries/tool-set-comment-reaction";
import { useToolUpdateComment } from "../-queries/tool-update-comment";
import { DeleteCommentDialog } from "./delete-comment-dialog";
import { ToolCommentReplies } from "./tool-comment-replies";

type ToolCommentProps = ReturnType<typeof useToolComments>["data"][number];

export function ToolComment(comment: ToolCommentProps) {
  const { slug } = useParams({ from: "/tools/@{$slug}" });
  const { user } = auth.useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const {
    isPending,
    mutate: setCommentReaction,
    variables,
  } = useToolSetCommentReaction(slug, comment.parentCommentId);
  const { isPending: isUpdating, mutate: updateComment } =
    useToolUpdateComment(slug);

  const { copyToClipboard } = useCopyToClipboard();

  const handleUpdateComment = () => {
    if (!user?.id) return globalThis.location.assign("/signin");

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

  const handleSetCommentReaction = (value: -1 | 1) => {
    if (!user?.id) return globalThis.location.assign("/signin");
    setCommentReaction({ commentId: comment._id, value });
  };

  const handleReportComment = async () => {
    const commentHash = `comment-${comment._id}`;
    const commentLink = `${globalThis.location.origin}/tools/${slug}#${commentHash}`;
    const reportDetails = [
      `Tool Slug: ${slug}`,
      `Comment ID: ${comment._id}`,
      `Comment Link: ${commentLink}`,
      `Comment Author: @${comment.user.username}`,
      `Reported By: @${user?.username ?? "anonymous"}`,
    ].join("\n");

    const copiedReport = await copyToClipboard(reportDetails);

    globalBannerStore.add({
      autoDismiss: false,
      description: copiedReport
        ? "Comment report details copied to your clipboard. Paste them in Grepedia's Discord server to submit your report."
        : "Failed to copy the report details. Please try again.",
      title: copiedReport ? "Copied successfully" : "Copy failed",
      variant: copiedReport ? "success" : "destructive",
    });

    if (copiedReport) {
      globalThis.open(env.VITE_REPORT_TOOL_URL, "_blank", "noreferrer");
    }
  };

  const isAuthor = comment.user._id === user?.id;
  const isEdited =
    new Date(comment.updatedAt).getTime() >
    new Date(comment.createdAt).getTime();
  const hasUpvoted = comment.viewerReaction === 1;
  const hasDownvoted = comment.viewerReaction === -1;
  const isPendingForComment = isPending && variables?.commentId === comment._id;
  const canDelete = isAuthor && comment.replyCount === 0;

  return (
    <div className="flex gap-3" id={`comment-${comment._id}`}>
      <Avatar>
        <AvatarImage
          alt={comment.user.name}
          src={getAvatar(comment.user.username)}
        />
        <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              @{comment.user.username}
            </span>
            {isAuthor && <Badge className="text-primary">Author</Badge>}
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
              {!isAuthor && (
                <DropdownMenuItem onClick={handleReportComment}>
                  <FlagIcon />
                  Report
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DeleteCommentDialog commentId={comment._id} userId={user.id} />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <MarkdownEditor
              maxLength={5000}
              minLength={1}
              onChange={(event) => {
                const value = event.target.value;
                if (value.length > 5000) return;
                setDraft(value);
              }}
              placeholder="Update your comment..."
              required={true}
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
                disabled={!draft.trim() || isUpdating}
                onClick={handleUpdateComment}
                size="xs"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <MarkdownPreview className="prose-sm" value={comment.content} />
        )}
        <div className="flex flex-wrap items-center">
          <Button
            className={cn("text-muted-foreground", hasUpvoted && "text-info")}
            disabled={isPendingForComment}
            onClick={() => handleSetCommentReaction(1)}
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
            onClick={() => handleSetCommentReaction(-1)}
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
