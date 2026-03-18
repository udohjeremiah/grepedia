import { useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertTriangleIcon, FileJsonIcon } from "lucide-react";

import { auth } from "@/hooks/auth";

import { useUserRecoveryPackage } from "../-queries/user-recovery-package";

export default function DownloadJSON() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const { user } = auth.useSession();
  const {
    data: userRecoveryPackage,
    isPending,
    refetch,
  } = useUserRecoveryPackage({ userId });

  if (isPending) {
    return <Skeleton className="h-9 w-40 rounded-4xl" />;
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

  function handleDownload() {
    const username = user?.username ?? "account";
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
    <Button onClick={handleDownload} variant="secondary">
      <FileJsonIcon /> Download JSON
    </Button>
  );
}
