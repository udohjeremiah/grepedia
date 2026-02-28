import { useRouteContext } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { formatDistanceToNow } from "date-fns";
import { ExternalLinkIcon, Trash2Icon } from "lucide-react";

import AppLink from "@/components/app-link";
import SubmissionAlert from "@/components/submission-alert";
import { categoryVariants } from "@/constants/category";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useSubmission } from "@/hooks/use-submission";

import { useUserBookmarks } from "../-queries/user-bookmarks";
import { useUserRemoveBookmark } from "../-queries/user-remove-bookmark";

type UserBookmarkProps = ReturnType<typeof useUserBookmarks>["data"][number];

export default function UserBookmark(bookmark: UserBookmarkProps) {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { isPending, mutate: removeBookmark } = useUserRemoveBookmark(userId);
  const { resetStatus, setError, status } = useSubmission();
  const { handleOpenChange, isOpen, setIsOpen } = useDialogState({
    onCloseReset: () => {
      resetStatus();
    },
  });

  function handleRemoveBookmark() {
    resetStatus();

    removeBookmark(
      { bookmarkId: bookmark._id, userId },
      {
        onError: (error) => {
          setError(
            "Couldn't remove bookmark",
            error.message ??
              "An error occurred while removing this bookmark. Please try again.",
          );
        },
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  }

  return (
    <Button
      asChild
      className="flex size-full flex-wrap items-start justify-between gap-4 p-4 whitespace-normal"
      variant="outline"
    >
      <div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AppLink params={{ slug: bookmark.slug }} to="/tools/@{$slug}">
                {bookmark.name}
              </AppLink>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bookmark.bookmarkedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-muted-foreground">{bookmark.shortDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookmark.categories.map((category, index) => (
              <Badge key={category} variant={categoryVariants[index]}>
                {category}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="icon-sm" variant="ghost">
            <a href={bookmark.officialUrl} rel="noreferrer" target="_blank">
              <ExternalLinkIcon />
              <span className="sr-only">Visit {bookmark.name}</span>
            </a>
          </Button>
          <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
            <AlertDialogTrigger asChild>
              <Button disabled={isPending} size="sm" variant="ghost">
                <Trash2Icon />
                <span className="sr-only">Remove {bookmark.name} bookmark</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2Icon className="size-5 text-destructive" />
                  Remove Bookmark
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Remove {bookmark.name} from your bookmarks?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <SubmissionAlert status={status} />
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    handleRemoveBookmark();
                  }}
                  variant="destructive"
                >
                  {isPending ? "Removing..." : "Remove Bookmark"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Button>
  );
}
