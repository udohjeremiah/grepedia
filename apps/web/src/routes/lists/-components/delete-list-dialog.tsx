import { useNavigate, useParams } from "@tanstack/react-router";
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
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";

import { SubmissionAlert } from "@/components/submission-alert";
import { auth } from "@/hooks/auth";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";

import { useDeleteList } from "../-queries/user-delete-list";

export function DeleteListDialog() {
  const { slug } = useParams({ from: "/lists/$slug" });
  const navigate = useNavigate();

  const { user } = auth.useSession();

  const { isPending: isDeleting, mutate: deleteList } = useDeleteList();

  const { resetStatus, setApiError, status } = useSubmission();

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      resetStatus();
    },
  });

  const handleDeleteList = () => {
    if (!user) return globalThis.location.assign("/signin");

    deleteList(
      { slug },
      {
        onError: (error) => {
          setApiError("Couldn't delete list", error);
        },
        onSuccess: () => {
          navigate({
            params: { username: user.displayUsername },
            to: "/@{$username}/lists",
          });
        },
      },
    );
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2Icon /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Delete List
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <span>Are you sure you want to delete this list?</span>
            <span>This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <SubmissionAlert status={status} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              handleDeleteList();
            }}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Spinner /> Deleting
              </>
            ) : (
              "Delete List"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
