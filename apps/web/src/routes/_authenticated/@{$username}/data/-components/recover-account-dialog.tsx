import { useRouteContext } from "@tanstack/react-router";
import { recoverUserAccountBodySchema } from "@workspace/shared/schemas/users/recovery-package/recover-user-account";
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

import { SubmissionAlert } from "@/components/submission-alert";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";

import { useUserRecoverAccount } from "../-queries/user-recover-account";

export function RecoverAccountDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const [payload, setPayload] = useState("");

  const { isPending: isRecovering, mutate: recoverAccount } =
    useUserRecoverAccount(userId);

  const { resetStatus, setApiError, setError, setSuccess, status } =
    useSubmission();

  const handleRecover = () => {
    resetStatus();

    if (!payload.trim()) {
      setError("Missing data", "Paste your recovery package to continue.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError("Invalid JSON", "The recovery package must be valid JSON.");
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
      setError("Invalid package", "The recovery package format is invalid.");
      return;
    }

    recoverAccount(
      {
        body: { recoveryPackage },
        params: { userId },
      },
      {
        onError: (error) => {
          setApiError("Couldn't recover account", error);
        },
        onSuccess: () => {
          setPayload("");
          setSuccess(
            "Account recovered",
            "Your account was recovered successfully.",
          );
        },
      },
    );
  };

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      setPayload("");
      resetStatus();
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
            required={true}
            value={payload}
            wrap="off"
          />
        </div>
        <SubmissionAlert status={status} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!payload.trim() || isRecovering}
            onClick={handleRecover}
          >
            {isRecovering ? (
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
