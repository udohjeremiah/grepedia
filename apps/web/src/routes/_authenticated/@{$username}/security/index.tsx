import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { AlertTriangleIcon, LockIcon, MailIcon } from "lucide-react";

import { accountDeletion } from "@/constants/account-deletion";

import { ChangeEmailDialog } from "./-components/change-email-dialog";
import { ChangePasswordDialog } from "./-components/change-password-dialog";
import { DeleteAccountDialog } from "./-components/delete-account-dialog";

export const Route = createFileRoute("/_authenticated/@{$username}/security/")({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [
      { title: "Security • Grepedia" },
      {
        content: `Manage password, email, and account security settings for @${params.username}.`,
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <div className="flex flex-1 flex-col gap-6">
        <div className="border p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
              <MailIcon className="size-5" />
            </div>
            <div className="flex w-full justify-between gap-4 max-sm:flex-col">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">
                  Change your email to keep your account secure.
                </p>
              </div>
              <ChangeEmailDialog />
            </div>
          </div>
        </div>
        <div className="border p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
              <LockIcon className="size-5" />
            </div>
            <div className="flex w-full justify-between gap-4 max-sm:flex-col">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password to keep your account secure.
                </p>
              </div>
              <ChangePasswordDialog />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 border border-destructive/30 p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
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
          <div className="flex flex-col gap-4 border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="text-sm font-medium">Delete Account</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                Permanently delete your account and personal data. This action
                cannot be undone.
              </p>
              <ul className="flex flex-col gap-1 pl-4 text-xs">
                {accountDeletion.map((info) => (
                  <li className="flex gap-2" key={info}>
                    <span className="mt-1 size-1 shrink-0 bg-muted-foreground" />
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
