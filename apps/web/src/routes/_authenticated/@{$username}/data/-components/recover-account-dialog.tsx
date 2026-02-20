import { useRouteContext } from "@tanstack/react-router";
import { recoverUserAccountBodySchema } from "@workspace/shared/schemas/users/recover-user-account";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { Textarea } from "@workspace/ui/components/textarea";
import { RotateCcwIcon } from "lucide-react";
import { useState } from "react";

import SubmissionStatusAlert, {
  type SubmissionStatus,
} from "@/components/submission-status-alert";
import { useDialogState } from "@/hooks/use-dialog-state";

import { useUserRecoverAccount } from "../-queries/user-recover-account";

export default function RecoverAccountDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const [payload, setPayload] = useState("");
  const { isPending, mutate: recoverAccount } = useUserRecoverAccount(userId);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();

  const handleRecover = async () => {
    setSubmissionStatus(undefined);

    if (!payload.trim()) {
      setSubmissionStatus({
        description: "Paste your recovery package to continue.",
        status: "error",
        title: "Missing data",
      });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setSubmissionStatus({
        description: "The recovery package must be valid JSON.",
        status: "error",
        title: "Invalid JSON",
      });
      return;
    }

    const recoveryPackageCandidate =
      typeof parsed === "object" &&
      parsed !== null &&
      "recoveryPackage" in parsed
        ? (parsed as { recoveryPackage: unknown }).recoveryPackage
        : parsed;

    let recoveryPackage: ReturnType<
      typeof recoverUserAccountBodySchema.parse
    >["recoveryPackage"];
    try {
      recoveryPackage = recoverUserAccountBodySchema.parse({
        recoveryPackage: recoveryPackageCandidate,
      }).recoveryPackage;
    } catch {
      setSubmissionStatus({
        description: "The recovery package format is invalid.",
        status: "error",
        title: "Invalid package",
      });
      return;
    }

    recoverAccount(
      {
        body: { recoveryPackage },
        params: { userId },
      },
      {
        onError: (error) => {
          setSubmissionStatus({
            description:
              error.message ??
              "An error occurred while recovering your account. Please try again.",
            status: "error",
            title: "Couldn't recover account",
          });
        },
        onSuccess: () => {
          setPayload("");
          setSubmissionStatus({
            description: "Your account was recovered successfully.",
            status: "success",
            title: "Account recovered",
          });
        },
      },
    );
  };

  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      setPayload("");
      setSubmissionStatus(undefined);
    },
  });

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button>
          <RotateCcwIcon />
          Recover Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recover Account</DialogTitle>
          <DialogDescription>
            Paste the recovery package you exported earlier. We will verify the
            signature and re-link your past contributions to this account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="recovery-package">Recovery Package</Label>
          <Textarea
            className="max-h-96 font-mono text-xs"
            id="recovery-package"
            onChange={(event) => setPayload(event.target.value)}
            placeholder="Paste the recovery package JSON here..."
            value={payload}
            wrap="off"
          />
        </div>
        <SubmissionStatusAlert submissionStatus={submissionStatus} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={handleRecover}>
            {isPending ? (
              <>
                <Spinner /> Recovering...
              </>
            ) : (
              "Recover Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
