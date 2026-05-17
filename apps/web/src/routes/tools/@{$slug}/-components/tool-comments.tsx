import { useParams } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { cn } from "@workspace/ui/lib/cn";
import { MessageSquareIcon, SendIcon } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";

import { MarkdownEditor } from "@/components/markdown";
import { auth } from "@/hooks/auth";
import { globalBannerStore } from "@/lib/global-banner-store";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getAvatar } from "@/utils/get-avatar";
import { getInitials } from "@/utils/get-initials";

import { useTool } from "../-queries/tool";
import { useToolAddComment } from "../-queries/tool-add-comment";
import { useToolComments } from "../-queries/tool-comments";
import { ToolComment } from "./tool-comment";

type SortedView = "bottom" | "newest" | "top";

export function ToolComments() {
  const { slug } = useParams({ from: "/tools/@{$slug}" });
  const { data: tool } = useTool({ slug });

  const [sortedView, setSortedView] = useState<SortedView>("top");
  const [newComment, setNewComment] = useState("");

  const { user } = auth.useSession();
  const { isPending, mutate: addComment } = useToolAddComment(slug);

  const handleAddComment = async () => {
    if (!user?.id) return globalThis.location.assign("/signin");

    const content = newComment.trim();
    if (!content) {
      globalBannerStore.add({
        description: "Enter your comment to continue.",
        title: "Missing data",
        variant: "destructive",
      });
      return;
    }

    addComment(
      { content },
      {
        onError: () => {
          globalBannerStore.add({
            description:
              "An error occurred while posting your comment. Please try again.",
            title: "Couldn't add comment",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          setSortedView("newest");
          setNewComment("");
          globalBannerStore.add({
            description: "Your comment was posted successfully.",
            title: "Comment added successfully",
            variant: "success",
          });
        },
      },
    );
  };

  return (
    <div className="relative border">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <MessageSquareIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Comments</h3>
          <Badge variant="secondary">
            {formatCompactNumber(tool.stats.comments)}
          </Badge>
        </div>
        <ToggleGroup
          onValueChange={(value) => {
            if (!value) return;
            setSortedView(value as SortedView);
          }}
          size="sm"
          type="single"
          value={sortedView}
          variant="outline"
        >
          <ToggleGroupItem value="top">Top</ToggleGroupItem>
          <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
          <ToggleGroupItem value="newest">Newest</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Separator />
      <div className="flex gap-3 px-6 py-4 max-md:flex-col">
        {user && (
          <div className="flex gap-4 max-md:items-center">
            <Avatar>
              <AvatarImage alt={user.name} src={getAvatar(user.username)} />
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {getInitials(user.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium md:hidden">Add a comment</p>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <MarkdownEditor
            maxLength={5000}
            minLength={1}
            onChange={(event) => {
              const value = event.target.value;
              if (value.length > 5000) return;
              setNewComment(value);
            }}
            placeholder="Share your thoughts on this tool..."
            required={true}
            value={newComment}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Markdown is supported.
            </p>
            <Button
              disabled={!newComment.trim() || isPending}
              onClick={handleAddComment}
              size="sm"
            >
              <SendIcon className="size-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      <Suspense>
        <ToolCommentList slug={slug} sortedView={sortedView} />
      </Suspense>
    </div>
  );
}

function ToolCommentList({
  slug,
  sortedView,
}: {
  slug: string;
  sortedView: SortedView;
}) {
  const trackingRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
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
        <div className="flex items-center justify-center border bg-background p-1">
          <Spinner className="size-5" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none h-1"
        ref={trackingRef}
      />
    </>
  );
}
