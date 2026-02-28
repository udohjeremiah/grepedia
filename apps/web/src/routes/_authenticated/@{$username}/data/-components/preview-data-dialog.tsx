import { useRouteContext } from "@tanstack/react-router";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertTriangleIcon, CheckIcon, CopyIcon } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useDialogState } from "@/hooks/use-dialog-state";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";

export default function PreviewDataDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const {
    data: userRecoveryPackage,
    isPending,
    refetch,
  } = useUserRecoveryPackage({
    userId,
  });
  const { copied, copyToClipboard, resetCopied } = useCopyToClipboard();
  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      resetCopied();
    },
  });

  if (isPending) {
    return <Skeleton className="h-9 w-28 rounded-4xl" />;
  }

  if (!userRecoveryPackage) {
    return (
      <Button onClick={() => refetch()} variant="destructive">
        <AlertTriangleIcon />
        Click to try again...
      </Button>
    );
  }

  const exportJson = JSON.stringify(
    userRecoveryPackage.recoveryPackage,
    undefined,
    2,
  );

  async function handleCopy() {
    await copyToClipboard(exportJson);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Preview Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Account Data Preview</DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span>
              This is the recovery package that will be exported as JSON.
            </span>
            <span>Valid for 1 year. Do not share it.</span>
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-96 overflow-auto rounded-md border bg-card p-4 font-mono text-xs">
          {exportJson}
        </pre>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button disabled={copied} onClick={handleCopy} size="sm">
            {copied ? (
              <>
                <CheckIcon />
                Copied
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
