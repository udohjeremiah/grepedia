import { useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { DownloadIcon, FileJsonIcon } from "lucide-react";

import { auth } from "@/hooks/auth";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";
import PreviewDataDialog from "./preview-data-dialog";
import RecoverAccountDialog from "./recover-account-dialog";

export default function UserData() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: sessionData } = auth.useSession();
  const { data: userRecoveryPackage } = useUserRecoveryPackage({ userId });

  const exportJson = JSON.stringify(
    userRecoveryPackage.recoveryPackage,
    undefined,
    2,
  );

  function handleDownload() {
    const username = sessionData?.user.username ?? "account";
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `account-${username}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.append(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border p-6">
      <div className="flex gap-4 border-b pb-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DownloadIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-foreground">
            Export Recovery Package
          </h3>
          <p className="text-sm text-muted-foreground">
            Download a signed recovery package. It is valid for 1 year and can
            be reused. If someone gets it, they can claim your contributions.
            Keep it private and delete it after use. Re-download if needed.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <RecoverAccountDialog />
        <Button onClick={handleDownload} variant="secondary">
          <FileJsonIcon /> Download JSON
        </Button>
        <PreviewDataDialog />
      </div>
    </div>
  );
}
