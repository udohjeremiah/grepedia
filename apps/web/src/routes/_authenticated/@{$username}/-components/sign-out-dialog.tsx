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
import { LogOutIcon } from "lucide-react";
import { useState } from "react";

import { auth } from "@/hooks/auth";
import { signOut } from "@/services/auth/sign-out";

export default function SignOutDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [revokeAllSessions, setRevokeAllSessions] = useState(false);
  const { mutate: revokeSessions } = auth.useRevokeSessions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const signOutText = revokeAllSessions ? "Sign Out Everywhere" : "Sign Out";

  const handleSignOut = async () => {
    setIsSubmitting(true);

    if (revokeAllSessions) {
      revokeSessions({
        fetchOptions: {
          onError: () => {
            setIsSubmitting(false);
          },
          onSuccess: () => {
            setIsSubmitting(false);
            setIsDialogOpen(false);
            navigate({ reloadDocument: true, to: "/signin" });
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
          setIsDialogOpen(false);
          navigate({ reloadDocument: true, to: "/signin" });
        },
      },
    });
  };

  return (
    <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
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
        <div className="flex gap-2 rounded-xl border p-3 has-aria-checked:border-primary/50 has-aria-checked:bg-primary/10">
          <Checkbox
            checked={revokeAllSessions}
            className="mt-0.5"
            id="revokeAllSessions"
            onCheckedChange={(checked) =>
              setRevokeAllSessions(checked === true)
            }
          />
          <div>
            <Label
              className="text-sm font-medium text-foreground"
              htmlFor="revokeAllSessions"
            >
              Also sign out of all other devices
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Other devices will be signed out within 5 minutes.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            onClick={() => setRevokeAllSessions(false)}
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
