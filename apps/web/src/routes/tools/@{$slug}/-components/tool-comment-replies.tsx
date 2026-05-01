import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareIcon } from "lucide-react";

import { MarkdownPreview } from "@/components/markdown";
import { useDialog } from "@/hooks/use-dialog";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getAvatar } from "@/utils/get-avatar";
import { getInitials } from "@/utils/get-initials";

import { useToolCommentReplies } from "../-queries/tool-comment-replies";
import { useToolComments } from "../-queries/tool-comments";
import ToolComment from "./tool-comment";
import ToolCommentReply from "./tool-comment-reply";

type ToolComment = ReturnType<typeof useToolComments>["data"][number];

interface ToolCommentRepliesProps {
  comment: ToolComment;
  slug: string;
}

export default function ToolCommentReplies({
  comment,
  slug,
}: ToolCommentRepliesProps) {
  const { handleOpenChange, isOpen } = useDialog();

  const {
    data: replies = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useToolCommentReplies({ commentId: comment._id, slug }, isOpen);

  let repliesContent;
  if (isLoading) {
    repliesContent = (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-3" />
        Loading replies...
      </div>
    );
  } else if (replies.length > 0) {
    repliesContent = replies.map((replyItem) => (
      <ToolComment {...replyItem} key={replyItem._id} />
    ));
  } else {
    repliesContent = (
      <p className="text-sm text-muted-foreground">
        No replies yet. Be the first to reply.
      </p>
    );
  }

  const isEdited =
    new Date(comment.updatedAt).getTime() >
    new Date(comment.createdAt).getTime();

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild={true}>
        <Button className="text-muted-foreground" size="xs" variant="ghost">
          <MessageSquareIcon />
          {formatCompactNumber(comment.replyCount)} replies
        </Button>
      </DialogTrigger>
      <DialogContent className="h-svh max-w-full p-0 sm:h-[90svh] sm:max-w-4xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Thread</DialogTitle>
          <DialogDescription>
            Parent comment stays pinned while replies scroll below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col overflow-hidden border">
          <div className="flex gap-3 bg-muted/30 px-4 py-3">
            <Avatar>
              <AvatarImage
                alt={comment.user.name}
                src={getAvatar(comment.user.username)}
              />
              <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  @{comment.user.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {isEdited && (
                  <span className="text-xs text-muted-foreground">edited</span>
                )}
              </div>
              <MarkdownPreview className="prose-sm" value={comment.content} />
              {comment.viewerReaction !== undefined && (
                <p className="text-xs text-muted-foreground">
                  You {comment.viewerReaction === 1 ? "upvoted" : "downvoted"}{" "}
                  this comment.
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div className="px-4 py-3">
            <ToolCommentReply
              commentId={comment._id}
              slug={slug}
              username={comment.user.username}
            />
          </div>
          <Separator />
          <div className="overflow-y-auto px-4 py-3">
            <div className="space-y-4">
              {repliesContent}
              {hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    className="text-muted-foreground"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    size="xs"
                    variant="ghost"
                  >
                    {isFetchingNextPage ? "Loading..." : "Show more replies"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
