import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import Bowser from "bowser";
import { LaptopMinimalIcon } from "lucide-react";

import type { Session } from "@/lib/auth-client";

import { auth } from "@/hooks/auth";

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
  const { session } = auth.useSession();
  const { data: sessions } = auth.useListSessions();

  const sessionList =
    session && sessions ? formatSessions(sessions, session.id) : [];

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
