import { useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { FileJsonIcon } from "lucide-react";

import { auth } from "@/hooks/auth";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";

export default function DownloadJSON() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const { user } = auth.useSession();
  const { data: userRecoveryPackage } = useUserRecoveryPackage({ userId });

  function handleDownload() {
    const exportJson = JSON.stringify(userRecoveryPackage, undefined, 2);
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `account-${user?.username ?? "account"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.append(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <Button onClick={handleDownload} variant="secondary">
      <FileJsonIcon /> Download JSON
    </Button>
  );
}
