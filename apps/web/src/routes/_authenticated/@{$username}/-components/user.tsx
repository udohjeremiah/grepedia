import type { ReactNode } from "react";

import { useRouteContext } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  InfoIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";

import { countryOptions } from "@/constants/country-options";
import { roleInfo } from "@/constants/role-info";
import { statusInfo } from "@/constants/status-info";

import { useUser } from "../-queries/user";
import EditUserDialog from "./edit-user-dialog";
import SignOutDialog from "./sign-out-dialog";

const roleVariants = {
  contributor: "warning",
  member: "secondary",
  moderator: "default",
} as const;

const statusVariants = {
  active: "success",
  deactivated: "destructive",
  suspended: "warning",
} as const;

const genderLabel = {
  female: "Female",
  male: "Male",
  nonBinary: "Non-binary",
  other: "Other",
  preferNotToSay: "Prefer not to say",
} as const;

export default function User() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { data: user } = useUser({ userId });

  const role = roleInfo[user.role];
  const status = statusInfo[user.status];
  const countryLabel =
    countryOptions.find((country) => country.value === user.country)?.label ??
    user.country ??
    "Not set";
  const userGender = user.gender ? genderLabel[user.gender] : "Not set";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4 border-b pb-6">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-8" />
          </div>
          <div className="flex w-full min-w-0 justify-between gap-4 max-sm:flex-col">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="truncate text-xl font-semibold text-foreground">
                {user.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <SignOutDialog />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant={roleVariants[user.role]}>{role.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <InfoIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={statusVariants[user.status]}>{status.label}</Badge>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 rounded-lg border p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Role Details
            </p>
            <p className="text-sm text-foreground">{role.description}</p>
          </div>
          <div className="space-y-1 rounded-lg border p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {user.status === "active" ? "Next Steps" : "Status Details"}
            </p>
            <p className="text-sm text-foreground">{status.nextStep}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex w-full justify-between gap-4 border-b pb-6 max-sm:flex-col">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">
              Account Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Your personal account details.
            </p>
          </div>
          <EditUserDialog />
        </div>
        <div className="flex flex-col gap-4">
          <InfoRow
            icon={<UserIcon className="size-4" />}
            label="Full Name"
            value={user.name}
          />
          <InfoRow
            icon={<MailIcon className="size-4" />}
            label="Email"
            value={user.email}
          />
          <InfoRow
            icon={<UserIcon className="size-4" />}
            label="Username"
            value={`@${user.displayUsername}`}
          />
          <InfoRow
            icon={<FlagIcon className="size-4" />}
            label="Country"
            value={countryLabel}
          />
          <InfoRow
            icon={<UserIcon className="size-4" />}
            label="Gender"
            value={userGender}
          />
          <InfoRow
            icon={<CalendarIcon className="size-4" />}
            label="Member Since"
            value={format(new Date(user.createdAt), "MMMM d, yyyy")}
          />
          <InfoRow
            icon={<ClockIcon className="size-4" />}
            label="Last Updated"
            value={format(new Date(user.updatedAt), "MMMM d, yyyy")}
          />
          <div className="space-y-1 rounded-md border p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Bio
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {user.bio ?? "You haven't added a bio yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium text-muted-foreground sm:min-w-30">
          {label}
        </span>
        <span className="truncate text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}
