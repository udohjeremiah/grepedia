import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Bowser from "bowser";
import { LaptopMinimalIcon } from "lucide-react";

import { auth } from "@/hooks/auth";
import { Session } from "@/lib/auth-client";

import ActiveSession from "./active-session";

export interface ActiveSession {
  browser: string;
  device: string;
  id: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
  os: string;
  token: string;
}

export default function ActiveSessions() {
  const { isPending: sessionPending, session } = auth.useSession();
  const { data: sessions, isPending: sessionsPending } = auth.useListSessions();

  if (sessionPending || sessionsPending) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-22 w-full rounded-lg" />
        <Skeleton className="h-22 w-full rounded-lg" />
        <Skeleton className="h-22 w-full rounded-lg" />
        <Skeleton className="h-22 w-full rounded-lg" />
      </div>
    );
  }

  if (!session || !sessions) {
    throw new Error("Couldn't load sessions");
  }

  const sessionList = formatSessions(sessions, session.id);

  return (
    <>
      {sessionList.length > 1 ? (
        <ul className="flex flex-col gap-3">
          {sessionList.map((session) => (
            <ActiveSession key={session.id} {...session} />
          ))}
        </ul>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LaptopMinimalIcon className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No other active sessions</EmptyTitle>
            <EmptyDescription>
              You are only signed in on this device right now.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}

function formatSessions(
  sessions: Array<Session["session"]>,
  currentSessionId?: string,
): ActiveSession[] {
  const formattedSessions = sessions.map((session) => {
    const { browser, device, os } = parseUserAgent(session.userAgent);

    return {
      browser,
      device,
      id: session.id,
      ip: session.ipAddress?.trim() || "Unknown IP",
      isCurrent: session.id === currentSessionId,
      lastActive: new Date(session.updatedAt).toISOString(),
      os,
      token: session.token,
    };
  });

  const currentSessions = formattedSessions.filter(
    (session) => session.isCurrent,
  );
  const otherSessions = formattedSessions.filter(
    (session) => !session.isCurrent,
  );

  return [...currentSessions, ...otherSessions];
}

function parseUserAgent(userAgent: null | string | undefined) {
  if (!userAgent) {
    return {
      browser: "Unknown browser",
      device: "Unknown device",
      os: "Unknown OS",
    };
  }

  const parser = Bowser.getParser(userAgent);

  const { name: browserName, version: browserVersion } = parser.getBrowser();
  const browserMajorVersion = browserVersion?.split(".")[0];
  const browserDisplayedVersion = browserMajorVersion
    ? ` ${browserMajorVersion}`
    : "";
  const browser = browserName
    ? `${browserName}${browserDisplayedVersion}`
    : "Unknown browser";

  const {
    name: osName,
    version: osVersion,
    versionName: osVersionName,
  } = parser.getOS();
  const osMajorVersion = osVersion?.split(".")[0];
  const osDisplayedVersion = osVersionName
    ? ` ${osVersionName}`
    : osMajorVersion || "";
  const os = osName ? `${osName} ${osDisplayedVersion}` : "Unknown OS";

  const platformType = parser.getPlatformType();
  let device: string;
  if (platformType === "mobile") {
    device = "Mobile";
  } else if (platformType === "tablet") {
    device = "Tablet";
  } else {
    device = "Desktop";
  }

  return { browser, device, os };
}
