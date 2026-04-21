import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/utils/cn";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  FlagIcon,
  InfoIcon,
  type LucideIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

import BadgeIcon from "@/components/badge-icon";
import { countryOptions } from "@/constants/country-options";
import { roleConfig, roleVariants } from "@/constants/role";
import { statusConfig, statusVariants } from "@/constants/status";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { getInitials } from "@/utils/get-initials";
import { getUserAvatar } from "@/utils/get-user-avatar";

import EditUserDialog from "./edit-user-dialog";
import SignOutDialog from "./sign-out-dialog";

const genderLabel = {
  female: "Female",
  male: "Male",
  nonBinary: "Non-binary",
  other: "Other",
  preferNotToSay: "Prefer not to say",
} as const;

export default function User() {
  const { isPending, user } = auth.useSession();

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    throw new Error("Couldn't load user");
  }

  const role = roleConfig[user.role];
  const status = statusConfig[user.status];
  const countryLabel =
    countryOptions.find((country) => country.value === user.country)?.label ??
    user.country ??
    "Not set";
  const userGender = user.gender ? genderLabel[user.gender] : "Not set";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4">
          <Avatar className="size-16">
            <AvatarImage
              alt={user.username}
              src={getUserAvatar(user.username)}
            />
            <AvatarFallback className="text-xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex w-full min-w-0 justify-between gap-4 max-sm:flex-col">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="flex items-center gap-1 text-xl font-semibold">
                <span className="truncate">{user.name}</span>
                <BadgeIcon
                  aria-label={role.label}
                  className={cn("size-5", role.color)}
                />
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <SignOutDialog />
          </div>
        </div>
        {user.status !== "active" && (
          <Alert
            variant={
              statusVariants[user.status] as
                | "destructive"
                | "info"
                | "success"
                | "warning"
            }
          >
            <AlertTitle>Account action required</AlertTitle>
            <AlertDescription>
              Your account is {status.label.toLowerCase()}. Open an appeal to
              get help from moderators.
            </AlertDescription>
            <AlertAction>
              <Button asChild size="xs" variant="outline">
                <a href={env.VITE_APPEAL_URL} rel="noreferrer" target="_blank">
                  Open Appeal
                </a>
              </Button>
            </AlertAction>
          </Alert>
        )}
        <Separator />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <BadgeIcon aria-label={role.label} className={cn(role.color)} />
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
            <p className="text-sm">{role.description}</p>
          </div>
          <div className="space-y-1 rounded-lg border p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {user.status === "active" ? "Next Steps" : "Status Details"}
            </p>
            <p className="text-sm">
              {status.nextStep}
              {user.status === "active" && user.role === "contributor" && (
                <>
                  {" "}
                  You can{" "}
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href={env.VITE_MODERATOR_REQUEST_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    submit a request
                  </a>{" "}
                  to become a moderator.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex w-full justify-between gap-4 max-sm:flex-col">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Account Information</h3>
            <p className="text-sm text-muted-foreground">
              Your personal account details.
            </p>
          </div>
          <EditUserDialog />
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <InfoRow icon={UserIcon} label="Full Name" value={user.name} />
          <InfoRow icon={MailIcon} label="Email" value={user.email} />
          <InfoRow
            icon={UserIcon}
            label="Username"
            value={`@${user.displayUsername}`}
          />
          <InfoRow icon={FlagIcon} label="Country" value={countryLabel} />
          <InfoRow icon={UserIcon} label="Gender" value={userGender} />
          <InfoRow
            icon={CalendarIcon}
            label="Member Since"
            value={format(new Date(user.createdAt), "MMMM d, yyyy")}
          />
          <InfoRow
            icon={ClockIcon}
            label="Last Updated"
            value={format(new Date(user.updatedAt), "MMMM d, yyyy")}
          />
          <div className="space-y-1 rounded-md border p-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Bio
            </p>
            <p className="text-sm leading-relaxed">
              {user.bio ?? "You haven't added a bio yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium text-muted-foreground sm:min-w-30">
          {label}
        </span>
        <span className="truncate text-sm">{value}</span>
      </div>
    </div>
  );
}
