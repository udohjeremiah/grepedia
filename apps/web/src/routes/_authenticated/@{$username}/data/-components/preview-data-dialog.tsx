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
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { useDialogState } from "@/hooks/use-dialog-state";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";

export default function PreviewDataDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: userRecoveryPackage } = useUserRecoveryPackage({ userId });
  const [copied, setCopied] = useState(false);
  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      setCopied(false);
    },
  });

  const exportJson = JSON.stringify(
    userRecoveryPackage.recoveryPackage,
    undefined,
    2,
  );

  function handleCopy() {
    navigator.clipboard.writeText(exportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Preview Data</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Account Data Preview</DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span>
              This is the recovery package that will be exported as JSON.
            </span>
            <span>Valid for 1 year. Do not share it.</span>
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-96 overflow-auto rounded-md border bg-secondary/50 p-4 font-mono text-xs text-foreground">
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
