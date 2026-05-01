import { useParams } from "@tanstack/react-router";
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
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";

import { useDialog } from "@/hooks/use-dialog";
import { globalBannerStore } from "@/lib/global-banner-store";

import { useToolDeleteComment } from "../-queries/tool-delete-comment";

interface DeleteCommentDialogProps {
  commentId: string;
  userId: string;
}

export default function DeleteCommentDialog({
  commentId,
  userId,
}: DeleteCommentDialogProps) {
  const { slug } = useParams({ from: "/tools/@{$slug}" });
  const { isPending, mutate: deleteComment } = useToolDeleteComment(slug);

  const { handleOpenChange, isOpen } = useDialog();

  const handleDeleteComment = () => {
    if (!userId) return globalThis.location.assign("/signin");

    deleteComment(
      { commentId },
      {
        onError: () => {
          globalBannerStore.add({
            description:
              "An error occurred while deleting your comment. Please try again.",
            title: "Couldn't delete comment",
            variant: "destructive",
          });
        },
        onSuccess: () => {
          globalBannerStore.add({
            description: "Your comment was deleted successfully.",
            title: "Comment deleted successfully",
            variant: "success",
          });
        },
      },
    );
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          variant="destructive"
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Delete Comment
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <span>Are you sure you want to delete this comment?</span>
            <span>This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleDeleteComment();
            }}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete Comment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
