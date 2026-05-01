import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/cn";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from "date-fns";
import {
  ClockIcon,
  GlobeIcon,
  MonitorIcon,
  NetworkIcon,
  SmartphoneIcon,
  TabletIcon,
  Trash2Icon,
} from "lucide-react";

import { auth } from "@/hooks/auth";
import { useDialog } from "@/hooks/use-dialog";

import type { ActiveSession } from "./active-sessions";

const DEVICE_ICON_MAP = {
  default: MonitorIcon,
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
} as const;

export function ActiveSession(session: ActiveSession) {
  const { isPending, mutate: revokeSession } = auth.useRevokeSession();

  const { handleOpenChange, isOpen, setIsOpen } = useDialog();

  const handleRevokeSession = () => {
    revokeSession({
      fetchOptions: {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
      token: session.token,
    });
  };

  const device = session.device.toLowerCase();

  const getDeviceKey = () => {
    if (device.includes("mobile")) return "mobile";
    if (device.includes("tablet")) return "tablet";
    return "default";
  };

  const DeviceIcon = DEVICE_ICON_MAP[getDeviceKey()];

  return (
    <div
      className={cn(
        "flex gap-4 border p-4",
        session.isCurrent && "border-primary/20 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center",
          session.isCurrent
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <DeviceIcon className="size-5" />
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{session.device}</span>
            {session.isCurrent && <Badge>Current</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <GlobeIcon className="size-3" />
              {session.browser} / {session.os}
            </span>
            <span className="flex items-center gap-1">
              <NetworkIcon className="size-3" />
              {session.ip}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {formatCompactRelativeTime(session.lastActive)}
            </span>
          </div>
        </div>
        {!session.isCurrent && (
          <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2Icon />
                <span className="sr-only">Revoke session</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2Icon className="size-5 text-destructive" />
                  Revoke Session
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign out the selected device within 5 minutes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    handleRevokeSession();
                  }}
                  variant="destructive"
                >
                  {isPending ? "Revoking..." : "Revoke Session"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function formatCompactRelativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const years = differenceInYears(now, date);
  if (years > 0) return `${years}y ago`;

  const months = differenceInMonths(now, date);
  if (months > 0) return `${months}mo ago`;

  const days = differenceInDays(now, date);
  if (days > 0) return `${days}d ago`;

  const hours = differenceInHours(now, date);
  if (hours > 0) return `${hours}h ago`;

  const minutes = differenceInMinutes(now, date);
  if (minutes > 0) return `${minutes}m ago`;

  const seconds = differenceInSeconds(now, date);
  if (seconds > 5) return `${seconds}s ago`;

  return "just now";
}
