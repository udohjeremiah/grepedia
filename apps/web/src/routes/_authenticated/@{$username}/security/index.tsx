import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/security/")({
  component: RouteComponent,
});

import { AlertTriangleIcon, LockIcon, MailIcon } from "lucide-react";

import { securityTips } from "@/constants/security-tips";

import ChangeEmailDialog from "./-components/change-email-dialog";
import ChangePasswordDialog from "./-components/change-password-dialog";

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-lg border p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MailIcon className="size-5" />
            </div>
            <div className="flex w-full justify-between gap-4 max-sm:flex-col">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">
                  Change your email to keep your account secure.
                </p>
              </div>
              <ChangeEmailDialog />
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LockIcon className="size-5" />
            </div>
            <div className="flex w-full justify-between gap-4 max-sm:flex-col">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-foreground">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password to keep your account secure.
                </p>
              </div>
              <ChangePasswordDialog />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border p-6">
          <div className="flex gap-4 border-b pb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-foreground">
                Security Recommendations
              </h3>
              <p className="text-sm text-muted-foreground">
                Tips to keep your account secure.
              </p>
            </div>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            {securityTips.map((tip) => (
              <li className="flex gap-2" key={tip}>
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
