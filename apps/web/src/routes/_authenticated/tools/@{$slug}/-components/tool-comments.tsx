import { useParams } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/utils/cn";
import { MessageSquareIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MarkdownEditor } from "@/components/markdown";
import { auth } from "@/hooks/auth";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getInitials } from "@/utils/get-initials";
import { getUserAvatar } from "@/utils/get-user-avatar";
import { globalBanner } from "@/utils/global-banner";

import { useTool } from "../-queries/tool";
import { useToolAddComment } from "../-queries/tool-add-comment";
import { useToolComments } from "../-queries/tool-comments";
import ToolComment from "./tool-comment";

type SortedView = "bottom" | "newest" | "top";

export default function ToolComments() {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });
  const { data: tool } = useTool({ slug });

  const trackingRef = useRef<HTMLDivElement>(null);
  const [sortedView, setSortedView] = useState<SortedView>("top");
  const [newComment, setNewComment] = useState("");

  const { user } = auth.useSession();
  const { isPending, mutate: addComment } = useToolAddComment(slug);

  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useToolComments({ slug }, { sort: sortedView });

  useEffect(() => {
    const sentinel = trackingRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const isInView = entry.isIntersecting;
        if (isInView) fetchNextPage();
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleNewComment = async () => {
    const content = newComment.trim();
    if (!content || !user) {
      globalBanner.emit({
        banner: {
          description: "Enter your comment to continue.",
          title: "Missing data",
          variant: "destructive",
        },
        type: "add",
      });
      return;
    }

    addComment(
      { content },
      {
        onError: () => {
          globalBanner.emit({
            banner: {
              description:
                "An error occurred while posting your comment. Please try again.",
              title: "Couldn't add comment",
              variant: "destructive",
            },
            type: "add",
          });
        },
        onSuccess: () => {
          setSortedView("newest");
          setNewComment("");
          globalBanner.emit({
            banner: {
              description: "Your comment was posted successfully.",
              title: "Comment added successfully",
              variant: "success",
            },
            type: "add",
          });
        },
      },
    );
  };

  return (
    <div className="relative rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <MessageSquareIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Comments</h3>
          <Badge variant="secondary">
            {formatCompactNumber(tool.stats.comments)}
          </Badge>
        </div>
        <ButtonGroup>
          <Button
            onClick={() => setSortedView("top")}
            size="xs"
            variant={sortedView === "top" ? "default" : "secondary"}
          >
            Top
          </Button>
          <Button
            onClick={() => setSortedView("bottom")}
            size="xs"
            variant={sortedView === "bottom" ? "default" : "secondary"}
          >
            Bottom
          </Button>
          <Button
            onClick={() => setSortedView("newest")}
            size="xs"
            variant={sortedView === "newest" ? "default" : "secondary"}
          >
            Newest
          </Button>
        </ButtonGroup>
      </div>
      <Separator />
      <div className="flex gap-3 px-6 py-4">
        {user ? (
          <Avatar>
            <AvatarImage alt={user.name} src={getUserAvatar(user.username)} />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {getInitials(user.name ?? "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton className="size-8 rounded-full" />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <MarkdownEditor
            onChange={(value = "") => {
              if (value.length > 5000) return;
              setNewComment(value);
            }}
            textareaProps={{
              maxLength: 5000,
              minLength: 1,
              placeholder: "Share your thoughts on this tool...",
              required: true,
            }}
            value={newComment}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Markdown is supported.
            </p>
            <Button
              disabled={!newComment.trim() || isPending}
              onClick={handleNewComment}
              size="sm"
            >
              <SendIcon className="size-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      <ul className="flex flex-col gap-6 px-6 py-4">
        {comments.map((comment) => (
          <li key={comment._id}>
            <ToolComment {...comment} />
          </li>
        ))}
      </ul>
      <div
        className={cn(
          "pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-200",
          isFetchingNextPage ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center rounded-full border bg-background p-1">
          <Spinner className="size-5" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none h-1"
        ref={trackingRef}
      />
    </div>
  );
}
