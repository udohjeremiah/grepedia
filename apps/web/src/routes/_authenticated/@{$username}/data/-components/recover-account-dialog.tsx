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

import { useUserRecoverAccount } from "../-queries/user-recover-account";

export default function RecoverAccountDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payload, setPayload] = useState("");
  const recoverAccount = useUserRecoverAccount(userId);
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

    try {
      await recoverAccount.mutateAsync({
        body: { recoveryPackage },
        params: { id: userId },
      });

      setSubmissionStatus({
        description: "Your account was recovered successfully.",
        status: "success",
        title: "Recovery complete",
      });
      setPayload("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while recovering your account.";
      setSubmissionStatus({
        description: message,
        status: "error",
        title: "Recovery failed",
      });
    }
  };

  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="recovery-package">Recovery Package</Label>
          <Textarea
            className="max-h-90"
            id="recovery-package"
            onChange={(event) => setPayload(event.target.value)}
            placeholder="Paste the recovery package JSON here..."
            rows={10}
            value={payload}
          />
        </div>
        <SubmissionStatusAlert submissionStatus={submissionStatus} />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => {
                setSubmissionStatus(undefined);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={recoverAccount.isPending} onClick={handleRecover}>
            {recoverAccount.isPending ? (
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
