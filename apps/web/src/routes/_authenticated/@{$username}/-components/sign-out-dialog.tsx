import { useNavigate } from "@tanstack/react-router";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { AlertTriangleIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";

import { auth } from "@/hooks/auth";
import { signOut } from "@/services/auth/sign-out";

export default function SignOutDialog() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [revokeAll, setRevokeAll] = useState(false);
  const { data: sessions } = auth.useListSessions();
  const { refetch } = auth.useSession();
  const { mutate: revokeSessions } = auth.useRevokeSessions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const sessionCount = sessions ? sessions.length : 0;
  const hasOtherSessions = sessionCount > 1;
  const signOutText = revokeAll ? "Sign Out Everywhere" : "Sign Out";

  const handleSignOut = async () => {
    setIsSubmitting(true);

    if (revokeAll) {
      revokeSessions({
        fetchOptions: {
          onError: () => {
            setIsSubmitting(false);
          },
          onSuccess: () => {
            setIsSubmitting(false);
            setDialogOpen(false);
            navigate({ to: "/signin" });
          },
        },
      });
      return;
    }

    void signOut({
      fetchOptions: {
        onError: () => {
          setIsSubmitting(false);
        },
        onSuccess: () => {
          setIsSubmitting(false);
          setDialogOpen(false);
          refetch();
          navigate({ to: "/signin" });
        },
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setDialogOpen} open={isDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          variant="destructive"
        >
          <LogOutIcon />
          Sign Out
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOutIcon className="size-5" />
            Sign Out
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to sign out of your current session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {hasOtherSessions && (
          <div className="space-y-2 rounded-md border bg-secondary/50 p-3">
            <div className="flex gap-3">
              <Checkbox
                checked={revokeAll}
                className="mt-0.5"
                id="signout-revoke"
                onCheckedChange={(checked) => setRevokeAll(checked === true)}
              />
              <div>
                <Label
                  className="text-sm font-medium text-foreground"
                  htmlFor="signout-revoke"
                >
                  Also sign out of all other devices
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You have {sessionCount - 1} other active{" "}
                  {sessionCount - 1 === 1 ? "session" : "sessions"}.
                </p>
              </div>
            </div>
            {revokeAll && (
              <div className="flex gap-2 rounded-md border border-info/20 bg-info/10 p-2">
                <AlertTriangleIcon className="mt-0.5 size-3 shrink-0 text-info" />
                <p className="text-xs text-info">
                  Session revocation for other devices will take effect within 5
                  minutes.
                </p>
              </div>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            onClick={() => setRevokeAll(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
            variant="destructive"
          >
            {isSubmitting ? "Signing out..." : signOutText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
