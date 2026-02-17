import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  AlertTriangleIcon,
  CircleCheckIcon,
  OctagonAlertIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { deleteUser } from "@/services/auth/delete-user";

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function DangerZone() {
  const { data: sessionData, isPending } = auth.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== sessionData?.user.username) {
      setSubmissionStatus({
        description:
          "The username you entered does not match your current username.",
        status: "error",
        title: "Username mismatch",
      });
      return;
    }

    setIsSubmitting(true);

    void deleteUser({
      callbackURL: `${env.VITE_BASE_URL}/signin`,
      fetchOptions: {
        onError: (context) => {
          setIsSubmitting(false);
          setSubmissionStatus({
            description:
              context.error.message ??
              "An error occurred while deleting your account. Please try again.",
            status: "error",
            title: "Deletion failed",
          });
        },
        onSuccess: () => {
          setDeleteConfirmText("");
          setIsSubmitting(false);
          setSubmissionStatus({
            description:
              "A confirmation link has been sent to your email address.",
            status: "success",
            title: "Check your email",
          });
        },
      },
    });
  };

  if (isPending) {
    return <Skeleton className="h-100 w-full rounded-lg" />;
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-destructive/30 p-6">
      <div className="flex gap-4 border-b pb-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-foreground">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Irreversible actions that affect your account permanently.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-destructive/20 bg-destructive/5 p-4">
        <h4 className="text-sm font-medium text-foreground">Delete Account</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Permanently delete your account and personal data. This action
            cannot be undone.
          </p>
          <ul className="flex flex-col gap-1 pl-4 text-xs">
            <li className="flex gap-2">
              <span className="mt-1 block size-1 shrink-0 rounded-full bg-muted-foreground" />
              Your tools, comments, and reactions will remain on the platform.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 block size-1 shrink-0 rounded-full bg-muted-foreground" />
              Your user profile and bookmarks will be permanently deleted.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 block size-1 shrink-0 rounded-full bg-muted-foreground" />
              If you recover your account later using your exported recovery
              package, your past contributions can be re-linked to your new
              account.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 block size-1 shrink-0 rounded-full bg-muted-foreground" />
              We strongly recommend exporting your account data before deleting
              your account.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 block size-1 shrink-0 rounded-full bg-muted-foreground" />
              Your recovery package is valid for 1 year; keep it private and
              delete it after use.
            </li>
          </ul>
        </div>
        <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
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
                  This will permanently delete your account profile and
                  bookmarks. Your tools, comments, and reactions will remain on
                  the platform.
                </span>
                <span className="rounded-lg border bg-info/10 p-3 text-xs text-info">
                  Export your account data first. You will need the recovery
                  package if you want to re-link your past contributions after
                  creating a new account.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Label className="text-sm" htmlFor="delete-confirm">
                Type{" "}
                <span className="font-mono text-foreground">
                  {sessionData?.user.username}
                </span>{" "}
                to confirm
              </Label>
              <Input
                id="delete-confirm"
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder={sessionData?.user.username}
                value={deleteConfirmText}
              />
            </div>
            {submissionStatus && (
              <Alert
                variant={
                  submissionStatus.status === "success" ? "success" : "critical"
                }
              >
                {submissionStatus.status === "success" ? (
                  <CircleCheckIcon />
                ) : (
                  <OctagonAlertIcon />
                )}
                <AlertTitle>{submissionStatus.title}</AlertTitle>
                <AlertDescription>
                  {submissionStatus.description}
                </AlertDescription>
              </Alert>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setSubmissionStatus(undefined);
                  setIsSubmitting(false);
                }}
              >
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
      </div>
    </div>
  );
}
