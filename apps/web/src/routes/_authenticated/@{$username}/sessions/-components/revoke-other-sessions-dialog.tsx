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

import { auth } from "@/hooks/auth";
import { useDialogState } from "@/hooks/use-dialog-state";

export default function RevokeOtherSessionsDialog() {
  const { session } = auth.useSession();
  const { data: sessions } = auth.useListSessions();
  const { isPending, mutate: revokeOtherSessions } =
    auth.useRevokeOtherSessions();

  const { handleOpenChange, isOpen, setIsOpen } = useDialogState();

  const sessionList = sessions ?? [];
  const currentSessionId = session?.id;
  const otherSessions = currentSessionId
    ? sessionList.filter((session) => session.id !== currentSessionId)
    : [];

  const handleRevokeOtherSessions = () => {
    revokeOtherSessions({
      fetchOptions: {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    });
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleRevokeOtherSessions();
            }}
            variant="destructive"
          >
            {isPending ? "Revoking..." : "Revoke Other Sessions"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
