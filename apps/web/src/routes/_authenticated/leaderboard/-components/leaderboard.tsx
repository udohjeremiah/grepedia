import { useRouteContext } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/utils/cn";
import { format } from "date-fns";
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CrownIcon,
  PlusIcon,
  RefreshCwIcon,
  TrophyIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { roleConfig, roleVariants } from "@/constants/role";
import { getInitials } from "@/utils/get-initials";

import { useUsersLeaderboard } from "../-queries/users-leaderboard";

type SortField = "toolsAdded" | "toolsOwned" | "toolsUpdated";

const categories = [
  {
    description: "Ranked by the number of tools submitted to the platform",
    icon: PlusIcon,
    id: "toolsAdded",
    label: "Most Tools Added",
    shortLabel: "Added",
  },
  {
    description: "Ranked by the number of tools they have updated",
    icon: RefreshCwIcon,
    id: "toolsUpdated",
    label: "Most Tools Updated",
    shortLabel: "Updated",
  },
  {
    description: "Ranked by the number of tools they own",
    icon: CrownIcon,
    id: "toolsOwned",
    label: "Most Tools Owned",
    shortLabel: "Owned",
  },
] as const;

export default function Leaderboard() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const trackingRef = useRef<HTMLDivElement>(null);

  const {
    data: { leaderboard, totals },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersLeaderboard({});

  const [activeCategory, setActiveCategory] = useState<SortField>("toolsAdded");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedLeaderBoard = useMemo(() => {
    const sortedResult = [...leaderboard];

    sortedResult.sort((a, b) => {
      const diff = b[activeCategory] - a[activeCategory];
      return sortDirection === "desc" ? diff : -diff;
    });

    return sortedResult.map((u, index) => ({ ...u, rank: index + 1 }));
  }, [activeCategory, leaderboard, sortDirection]);

  const currentCategory = categories.find(
    (category) => category.id === activeCategory,
  );

  useEffect(() => {
    const sentinel = trackingRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const stats = [
    {
      field: "toolsAdded",
      label: "Total Added",
      value: totals.totalAdded,
    },
    {
      field: "toolsUpdated",
      label: "Total Updated",
      value: totals.totalUpdated,
    },
    {
      field: "toolsOwned",
      label: "Total Owned",
      value: totals.totalOwned,
    },
  ] as const;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Button
            className={cn(
              "h-full flex-col gap-1 rounded-lg px-4 py-3",
              activeCategory === stat.field && "border-primary/20 bg-primary/5",
            )}
            key={stat.field}
            onClick={() => {
              setActiveCategory(stat.field);
              setSortDirection("desc");
            }}
            variant="outline"
          >
            <span
              className={cn(
                "text-xl font-bold",
                activeCategory === stat.field && "text-primary",
              )}
            >
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              className={cn(
                "gap-2 rounded-lg",
                activeCategory !== category.id && "text-muted-foreground",
              )}
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setSortDirection("desc");
              }}
              variant={activeCategory === category.id ? "secondary" : "ghost"}
            >
              <category.icon className="size-3.5" />
              <span className="max-sm:hidden">{category.label}</span>
              <span className="sm:hidden">{category.shortLabel}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {currentCategory?.description}
        </p>
      </div>
      <Separator />
      <div className="flex items-center gap-3 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <span className="w-9 shrink-0 text-center">#</span>
        <span className="flex-1">Contributor</span>
        <div className="grid w-72 grid-cols-3 justify-items-end gap-6 max-sm:hidden">
          {categories.map((category) => (
            <Tooltip key={category.id}>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "w-20 justify-end gap-1",
                    activeCategory === category.id && "text-primary",
                  )}
                  onClick={() => {
                    if (activeCategory === category.id) {
                      setSortDirection((direction) =>
                        direction === "desc" ? "asc" : "desc",
                      );
                    } else {
                      setActiveCategory(category.id);
                      setSortDirection("desc");
                    }
                  }}
                  size="xs"
                  variant="ghost"
                >
                  <span>{category.shortLabel}</span>
                  {activeCategory === category.id ? (
                    // eslint-disable-next-line sonarjs/no-nested-conditional
                    sortDirection === "desc" ? (
                      <ChevronDownIcon className="size-3" />
                    ) : (
                      <ChevronUpIcon className="size-3" />
                    )
                  ) : (
                    <ArrowUpDownIcon className="size-3 opacity-40" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{category.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Button
          className="flex items-center gap-1 text-primary sm:hidden"
          onClick={() =>
            setSortDirection((direction) =>
              direction === "desc" ? "asc" : "desc",
            )
          }
          size="xs"
          variant="ghost"
        >
          <span>{currentCategory?.shortLabel}</span>
          {sortDirection === "desc" ? (
            <ChevronDownIcon className="size-3" />
          ) : (
            <ChevronUpIcon className="size-3" />
          )}
        </Button>
      </div>
      <ul className="flex flex-col gap-1">
        {sortedLeaderBoard.map((user, index) => (
          <li
            className={cn(
              "flex gap-3 rounded-lg p-3 transition-colors",
              user.userId === userId
                ? "border border-primary/15 bg-primary/3"
                : "hover:bg-secondary/40",
              index < 3 && "py-4",
            )}
            key={user.username}
          >
            <RankBadge rank={user.rank} />
            <Avatar size={index < 3 ? "lg" : "default"}>
              <AvatarImage alt={user.username} src={user.image} />
              <AvatarFallback className="text-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {user.name}
                </span>
                {user.userId === userId && (
                  <Badge className="border-primary/20 bg-primary/10 text-primary">
                    You
                  </Badge>
                )}
                <Badge variant={roleVariants[user.role]}>
                  {roleConfig[user.role].label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>@{user.username}</span>
                <span className="text-muted-foreground/30">•</span>
                <span>
                  Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                </span>
              </div>
              <span className="text-xs text-muted-foreground sm:hidden">
                {currentCategory?.shortLabel}:{" "}
                <span className="font-semibold text-primary">
                  {user[activeCategory]}
                </span>
              </span>
            </div>
            <div className="grid w-72 grid-cols-3 gap-6 max-sm:hidden">
              <StatCell
                isActive={activeCategory === "toolsAdded"}
                value={user.toolsAdded}
              />
              <StatCell
                isActive={activeCategory === "toolsUpdated"}
                value={user.toolsUpdated}
              />
              <StatCell
                isActive={activeCategory === "toolsOwned"}
                value={user.toolsOwned}
              />
            </div>
          </li>
        ))}
      </ul>
      <div
        className={cn(
          "pointer-events-none flex justify-center py-2 transition-opacity duration-200",
          isFetchingNextPage ? "opacity-100" : "opacity-0",
        )}
      >
        <Spinner className="size-4" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none h-1"
        ref={trackingRef}
      />
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-warning/15 text-warning">
        <TrophyIcon className="size-4.5 fill-current" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-zinc-400/15 text-zinc-600 dark:bg-zinc-300/20 dark:text-zinc-200">
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

function StatCell({ isActive, value }: { isActive: boolean; value: number }) {
  return (
    <div className="w-20 px-4 text-right">
      <span
        className={cn(
          "text-sm font-semibold",
          isActive ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
