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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { SubmissionAlert } from "@/components/submission-alert";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";
import { deleteUser } from "@/services/auth/delete-user";

export function DeleteAccountDialog() {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { isPending, user } = auth.useSession();

  const {
    isSubmitting,
    resetStatus,
    setApiError,
    setError,
    setSubmitting,
    setSuccess,
    status,
  } = useSubmission();

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      setDeleteConfirmText("");
      setSubmitting(false);
      resetStatus();
    },
  });

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== user?.username) {
      setError(
        "Username mismatch",
        "The username you entered does not match your current username.",
      );
      return;
    }

    setSubmitting(true);

    await deleteUser({
      callbackURL: `${env.VITE_BASE_URL}/signin`,
      fetchOptions: {
        onError: (context) => {
          setSubmitting(false);
          setApiError("Couldn't delete account", context.error);
        },
        onSuccess: () => {
          setDeleteConfirmText("");
          setSubmitting(false);
          setSuccess(
            "Check your email",
            "A confirmation link has been sent to your email address.",
          );
        },
      },
    });
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={isPending} size="sm" variant="destructive">
          <Trash2Icon />
          Delete My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Delete Your Account
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-3">
            <span>
              This will permanently delete your user profile, bookmarks and
              reactions. Your tools, lists, and comments will remain on the
              platform.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label className="text-sm" htmlFor="delete-confirm">
            Type <span className="text-primary">{user?.username}</span> to
            confirm
          </Label>
          <Input
            id="delete-confirm"
            onChange={(event) => setDeleteConfirmText(event.target.value)}
            placeholder={user?.username}
            value={deleteConfirmText}
          />
        </div>
        <SubmissionAlert status={status} />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSubmitting(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              handleDeleteAccount();
            }}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Spinner /> Deleting...
              </>
            ) : (
              "Permanently Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
