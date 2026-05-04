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
import { useMemo } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useDialog } from "@/hooks/use-dialog";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";

export function PreviewDataDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const { copied, copyToClipboard, resetCopied } = useCopyToClipboard();
  const { data: userRecoveryPackage } = useUserRecoveryPackage({ userId });

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      resetCopied();
    },
  });

  const previewJson = useMemo(() => {
    if (!isOpen || !userRecoveryPackage) return "";

    const payloadData = userRecoveryPackage.payload.data;
    const limit = 5;

    const previewPackage = {
      ...userRecoveryPackage,
      payload: {
        ...userRecoveryPackage.payload,
        data: {
          ...payloadData,
          bookmarks: payloadData.bookmarks.slice(0, limit),
          commentReactions: payloadData.commentReactions.slice(0, limit),
          comments: payloadData.comments.slice(0, limit),
          toolReactions: payloadData.toolReactions.slice(0, limit),
          tools: payloadData.tools.slice(0, limit),
        },
        previewMeta: {
          bookmarksCount: payloadData.bookmarks.length,
          commentReactionsCount: payloadData.commentReactions.length,
          commentsCount: payloadData.comments.length,
          limit,
          toolReactionsCount: payloadData.toolReactions.length,
          toolsCount: payloadData.tools.length,
        },
      },
    };

    return JSON.stringify(previewPackage, undefined, 2);
  }, [isOpen, userRecoveryPackage]);

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
        <pre className="max-h-96 overflow-auto border bg-card p-4 font-mono text-xs">
          {previewJson}
        </pre>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button
            disabled={copied}
            onClick={async () => {
              const fullJson = JSON.stringify(
                userRecoveryPackage,
                undefined,
                2,
              );
              await copyToClipboard(fullJson);
            }}
            size="sm"
          >
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
