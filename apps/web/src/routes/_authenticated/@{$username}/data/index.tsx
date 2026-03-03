import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { AlertTriangleIcon, DownloadIcon } from "lucide-react";

import { accountDeletion } from "@/constants/account-deletion";

import DeleteAccountDialog from "./-components/delete-account-dialog";
import DownloadJSON from "./-components/download-json";
import PreviewDataDialog from "./-components/preview-data-dialog";
import RecoverAccountDialog from "./-components/recover-account-dialog";
import { userRecoveryPackageQueryOptions } from "./-queries/user-recovery-package";

export const Route = createFileRoute("/_authenticated/@{$username}/data/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(
      userRecoveryPackageQueryOptions({ userId: context.userId }),
    );
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Data & Privacy | Grepedia` },
      {
        content: `Export recovery data and manage account deletion and privacy actions for @${params.username}.`,
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-lg border p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DownloadIcon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Export Recovery Package</h3>
              <p className="text-sm text-muted-foreground">
                Download a signed recovery package. It is valid for 1 year and
                can be reused. If someone gets it, they can claim your
                contributions. Keep it private and delete it after use.
                Re-download if needed.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-4">
            <RecoverAccountDialog />
            <DownloadJSON />
            <PreviewDataDialog />
          </div>
        </div>
        <div className="flex flex-col gap-6 rounded-lg border border-destructive/30 p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Irreversible actions that affect your account permanently.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-4 rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="text-sm font-medium">Delete Account</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                Permanently delete your account and personal data. This action
                cannot be undone.
              </p>
              <ul className="flex flex-col gap-1 pl-4 text-xs">
                {accountDeletion.map((info) => (
                  <li className="flex gap-2" key={info}>
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                    {info}
                  </li>
                ))}
              </ul>
            </div>
            <DeleteAccountDialog />
          </div>
        </div>
      </div>
    </main>
  );
}
