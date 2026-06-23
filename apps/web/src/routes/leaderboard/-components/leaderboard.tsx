import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/cn";
import { format } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon, TrophyIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { countryOptions } from "@/constants/country-options";
import { auth } from "@/hooks/auth";
import { getAvatar } from "@/utils/get-avatar";
import { getInitials } from "@/utils/get-initials";

import { useUsersLeaderboard } from "../-queries/users-leaderboard";

type UserGender = "female" | "male" | "nonBinary" | "other" | "preferNotToSay";

const genderLabels: Record<UserGender, string> = {
  female: "Female",
  male: "Male",
  nonBinary: "Non-binary",
  other: "Other",
  preferNotToSay: "Prefer not to say",
};

export function Leaderboard() {
  const { user } = auth.useSession();

  const userId = user?.id;

  const trackingRef = useRef<HTMLDivElement>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const {
    data: { leaderboard },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersLeaderboard();

  const sortedLeaderBoard = useMemo(() => {
    const sortedResult = [...leaderboard];

    sortedResult.sort((a, b) => {
      const diff = b.toolsAdded - a.toolsAdded;
      return sortDirection === "desc" ? diff : -diff;
    });

    return sortedResult.map((u, index) => ({ ...u, rank: index + 1 }));
  }, [leaderboard, sortDirection]);

  useEffect(() => {
    const sentinel = trackingRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex h-[calc(100svh-18.76rem)] flex-col overflow-y-auto">
      <table className="w-full border-separate border-spacing-y-1">
        <thead className="sticky top-0 z-10">
          <tr className="[&_th]:bg-background [&_th]:px-3 [&_th]:py-0 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:text-muted-foreground [&_th]:uppercase">
            <th className="w-9 text-center">Rank</th>
            <th className="text-left">Contributor</th>
            <th className="text-right">
              <Button
                onClick={() =>
                  setSortDirection((direction) =>
                    direction === "desc" ? "asc" : "desc",
                  )
                }
                size="xs"
                variant="ghost"
              >
                <span>Added</span>
                {sortDirection === "desc" ? (
                  <ChevronDownIcon className="size-3" />
                ) : (
                  <ChevronUpIcon className="size-3" />
                )}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLeaderBoard.map((user, index) => (
            <tr
              className={cn(
                "transition-colors",
                user.userId === userId
                  ? "bg-primary/3 outline outline-primary/15"
                  : "hover:bg-secondary/40",
                index < 3 && "[&_td]:py-4",
              )}
              key={user.username}
            >
              <td className="w-9 p-3 text-center align-top">
                <RankBadge rank={user.rank} />
              </td>
              <td className="p-3 align-top">
                <div className="flex gap-3">
                  <Avatar size={index < 3 ? "lg" : "default"}>
                    <AvatarImage
                      alt={user.name}
                      src={getAvatar(user.username)}
                    />
                    <AvatarFallback className="text-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {user.name}
                      </span>
                      {user.userId === userId && (
                        <Badge className="text-primary">You</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>@{user.username}</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span>
                        Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                      </span>
                      {user.country && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="flex items-center gap-1">
                            <span aria-hidden>
                              {getFlagEmoji(user.country)}
                            </span>
                            <span>{getCountryLabel(user.country)}</span>
                          </span>
                        </>
                      )}
                      {user.gender && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{genderLabels[user.gender]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-3 text-right align-top">{user.toolsAdded}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={cn(
          "pointer-events-none flex justify-center py-2 transition-opacity duration-200",
          isFetchingNextPage ? "opacity-100" : "opacity-0",
        )}
      >
        <Spinner className="size-5" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none h-1"
        ref={trackingRef}
      />
    </div>
  );
}

function getCountryLabel(code: string) {
  return (
    countryOptions.find((country) => country.value === code)?.label ?? code
  );
}

function getFlagEmoji(code: string) {
  const base = 0x1_f1_e6;

  return (
    [...code.toUpperCase()]
      // eslint-disable-next-line unicorn/prefer-code-point
      .map((char) => String.fromCodePoint(base + char.charCodeAt(0) - 65))
      .join("")
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-chart-4/15 text-chart-4">
        <TrophyIcon className="size-4.5 fill-current" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-neutral-400/15 text-neutral-600 dark:bg-neutral-300/20 dark:text-neutral-200">
        <TrophyIcon className="size-4.5 fill-current" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-amber-700/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        <TrophyIcon className="size-4.5 fill-current" />
      </div>
    );

  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">
      {rank}
    </div>
  );
}
