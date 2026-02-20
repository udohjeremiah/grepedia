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
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { auth } from "@/hooks/auth";

export default function RevokeOtherSessionsDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: sessionData } = auth.useSession();
  const { data: sessions } = auth.useListSessions();
  const { mutate: revokeOtherSessions } = auth.useRevokeOtherSessions();

  const sessionList = sessions ?? [];
  const currentSessionId = sessionData?.session.id;
  const otherSessions = currentSessionId
    ? sessionList.filter((session) => session.id !== currentSessionId)
    : [];

  const handleRevokeOtherSessions = () => {
    setIsSubmitting(true);

    revokeOtherSessions({
      fetchOptions: {
        onError: () => {
          setIsSubmitting(false);
        },
        onSuccess: () => {
          setIsSubmitting(false);
          setIsDialogOpen(false);
        },
      },
    });
  };

  return (
    <AlertDialog
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setIsSubmitting(false);
        }
      }}
      open={isDialogOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          disabled={otherSessions.length === 0}
          size="sm"
          variant="destructive"
        >
          <Trash2Icon />
          Revoke Other Sessions
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Revoke Other Sessions
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <span>
              This will sign out all {otherSessions.length} other{" "}
              {otherSessions.length === 1 ? "device" : "devices"}. Only your
              current session will remain active.
            </span>
            <span className="rounded-lg border bg-info/10 p-3 text-xs text-info">
              Other devices will be signed out within 5 minutes. If you suspect
              unauthorized access, change your password immediately.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              handleRevokeOtherSessions();
            }}
            variant="destructive"
          >
            {isSubmitting ? "Revoking..." : "Revoke Other Sessions"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
