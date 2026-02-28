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
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/utils/cn";
import { MessageSquareIcon, SendIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { auth } from "@/hooks/auth";
import { useSubmission } from "@/hooks/use-submission";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { getInitials } from "@/utils/get-initials";

import { useTool } from "../-queries/tool";
import { useToolAddComment } from "../-queries/tool-add-comment";
import { useToolComments } from "../-queries/tool-comments";
import ToolComment from "./tool-comment";

type SortedView = "bottom" | "newest" | "top";

type ToolCommentItem = ReturnType<typeof useToolComments>["data"][number];

export default function ToolComments() {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}/" });
  const { data: tool } = useTool({ slug });
  const { user } = auth.useSession();
  const trackingRef = useRef<HTMLDivElement>(null);

  const [sortedView, setSortedView] = useState<SortedView>("top");
  const [sortedCommentIds, setSortedCommentIds] = useState<string[]>([]);

  const [newComment, setNewComment] = useState("");
  const { isPending, mutate: addComment } = useToolAddComment(slug);
  const { resetStatus, setError } = useSubmission();

  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useToolComments({ slug });

  useEffect(() => {
    if (sortedCommentIds.length > 0 || comments.length === 0) {
      return;
    }

    setSortedCommentIds(
      sortComments(comments, sortedView).map((comment) => comment._id),
    );
  }, [comments, sortedCommentIds.length, sortedView]);

  const applySortView = (view: SortedView) => {
    setSortedView(view);
    setSortedCommentIds(
      sortComments(comments, view).map((comment) => comment._id),
    );
  };

  const sortedComments = useMemo(() => {
    const commentById = new Map(
      comments.map((comment) => [comment._id, comment]),
    );
    const seen = new Set<string>();

    const currentSorted = sortedCommentIds
      .map((id) => {
        const comment = commentById.get(id);
        if (!comment) return;
        seen.add(id);
        return comment;
      })
      .filter((comment): comment is ToolCommentItem => comment !== undefined);

    const unseenComments = comments.filter((comment) => !seen.has(comment._id));
    return [...currentSorted, ...unseenComments];
  }, [comments, sortedCommentIds]);

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
    resetStatus();

    const content = newComment.trim();
    if (!content || !user) {
      setError("Missing data", "Enter your comment to continue.");
      return;
    }

    addComment(
      {
        content,
        user: {
          _id: user.id,
          image: user.image ?? undefined,
          name: user.name,
          username: user.username,
        },
      },
      {
        onError: () => {
          setError(
            "Couldn't add comment",
            "An error occurred while posting your comment. Please try again.",
          );
        },
        onSuccess: () => {
          applySortView("newest");
          setNewComment("");
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
            onClick={() => applySortView("top")}
            size="xs"
            variant={sortedView === "top" ? "default" : "secondary"}
          >
            Top
          </Button>
          <Button
            onClick={() => applySortView("bottom")}
            size="xs"
            variant={sortedView === "bottom" ? "default" : "secondary"}
          >
            Bottom
          </Button>
          <Button
            onClick={() => applySortView("newest")}
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
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {getInitials(user.name ?? "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton className="size-8 rounded-full" />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            className="max-h-52 min-h-20 text-sm"
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Share your thoughts on this tool..."
            required={true}
            value={newComment}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Markdown is not yet supported.
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
        {sortedComments.map((comment) => (
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

function sortComments(comments: ToolCommentItem[], sortedView: SortedView) {
  const sortedResults = [...comments];

  sortedResults.sort((a, b) => {
    const scoreA = a.stats.upvotes - a.stats.downvotes;
    const scoreB = b.stats.upvotes - b.stats.downvotes;

    switch (sortedView) {
      case "bottom": {
        if (scoreA !== scoreB) return scoreA - scoreB;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      case "newest": {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      case "top": {
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }
  });

  return sortedResults;
}
