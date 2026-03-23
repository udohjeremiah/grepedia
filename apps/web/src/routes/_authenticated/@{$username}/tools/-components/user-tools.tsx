import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/utils/cn";
import {
  ArrowUpRightIcon,
  FolderOpenIcon,
  type LucideIcon,
  MessageSquareIcon,
  PenLineIcon,
  PlusIcon,
  SearchIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useUserTools } from "../-queries/user-tools";
import AddToolDialog from "./add-tool-dialog";
import ToolDirectory from "./tool-directory";

type FilterView =
  | "added"
  | "all"
  | "commented"
  | "downvoted"
  | "updated"
  | "upvoted";

type StatConfigProps = {
  filterView: "all" | StatKey;
  setFilterView: (value: "all" | StatKey) => void;
  stats: Record<StatKey, number>;
};

type StatKey = "added" | "commented" | "downvoted" | "updated" | "upvoted";

export const getStatConfig = ({
  filterView,
  setFilterView,
  stats,
}: StatConfigProps) =>
  ({
    added: {
      colorClass: "bg-success/10 text-success",
      count: stats.added,
      icon: PlusIcon,
      isActive: filterView === "added",
      label: "Tools Added",
      onClick: () => setFilterView(filterView === "added" ? "all" : "added"),
    },
    commented: {
      colorClass: "bg-warning/10 text-warning",
      count: stats.commented,
      icon: MessageSquareIcon,
      isActive: filterView === "commented",
      label: "Comments Given",
      onClick: () =>
        setFilterView(filterView === "commented" ? "all" : "commented"),
    },
    downvoted: {
      colorClass: "bg-destructive/10 text-destructive",
      count: stats.downvoted,
      icon: ThumbsDownIcon,
      isActive: filterView === "downvoted",
      label: "Downvotes Given",
      onClick: () =>
        setFilterView(filterView === "downvoted" ? "all" : "downvoted"),
    },
    updated: {
      colorClass: "bg-info/10 text-info",
      count: stats.updated,
      icon: PenLineIcon,
      isActive: filterView === "updated",
      label: "Tools Updated",
      onClick: () =>
        setFilterView(filterView === "updated" ? "all" : "updated"),
    },
    upvoted: {
      colorClass: "bg-info/10 text-info",
      count: stats.upvoted,
      icon: ThumbsUpIcon,
      isActive: filterView === "upvoted",
      label: "Upvotes Given",
      onClick: () =>
        setFilterView(filterView === "upvoted" ? "all" : "upvoted"),
    },
  }) as const;

export default function UserTools() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const [filterView, setFilterView] = useState<FilterView>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: { stats, tools },
  } = useUserTools({ userId });

  const filteredTools = useMemo(() => {
    let filteredResult = [...tools];

    switch (filterView) {
      case "added": {
        filteredResult = filteredResult.filter((tool) => tool.relations.added);
        break;
      }
      case "commented": {
        filteredResult = filteredResult.filter(
          (tool) => tool.relations.commented,
        );
        break;
      }
      case "downvoted": {
        filteredResult = filteredResult.filter(
          (tool) => tool.relations.downvoted,
        );
        break;
      }
      case "updated": {
        filteredResult = filteredResult.filter(
          (tool) => tool.relations.updated,
        );
        break;
      }
      case "upvoted": {
        filteredResult = filteredResult.filter(
          (tool) => tool.relations.upvoted,
        );
        break;
      }
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return filteredResult;

    return filteredResult.filter((tool) => {
      const searchableText = [
        tool.name,
        tool.shortDescription,
        tool.slug,
        ...tool.categories,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [filterView, searchQuery, tools]);

  const filterLabel: Record<FilterView, string> = {
    added: "Tools You Added",
    all: "All Tools",
    commented: "Tools You Commented On",
    downvoted: "Tools You Downvoted",
    updated: "Tools You Updated",
    upvoted: "Tools You Upvoted",
  };

  const statConfig = getStatConfig({ filterView, setFilterView, stats });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <WrenchIcon className="size-5" />
          </div>
          <div className="flex w-full justify-between gap-4 max-sm:flex-col">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Your Activity</h3>
              <p className="text-sm text-muted-foreground">
                Overview of your contributions and interactions with tools.
              </p>
            </div>
            <AddToolDialog />
          </div>
        </div>
        <Separator />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard {...statConfig.added} />
          <StatCard {...statConfig.updated} />
          <StatCard {...statConfig.upvoted} />
          <StatCard {...statConfig.downvoted} />
          <StatCard {...statConfig.commented} />
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <FolderOpenIcon className="size-5" />
          </div>
          <div className="flex w-full justify-between gap-4 max-sm:flex-col">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Tool Directory</h3>
              <p className="text-sm text-muted-foreground">
                Browse tools you&apos;ve contributed to or interacted with,
                organized by relation.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/tools/directory">View All Tools</Link>
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tools by name, description, or category..."
              value={searchQuery}
            />
          </InputGroup>
          {filterView !== "all" && (
            <Button
              className="shrink-0 gap-2"
              onClick={() => setFilterView("all")}
              size="sm"
              variant="outline"
            >
              <XIcon className="size-3.5" />
              {filterLabel[filterView]}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {filteredTools.length}{" "}
            {filteredTools.length === 1 ? "tool" : "tools"}
            {filterView !== "all" && ` in "${filterLabel[filterView]}"`}
            {searchQuery && ` that match "${searchQuery}"`}
          </p>
          <ToolDirectory searchQuery={searchQuery} tools={filteredTools} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  colorClass,
  count,
  icon: Icon,
  isActive,
  label,
  onClick,
}: {
  colorClass: string;
  count: number;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="group flex size-full gap-3 p-3 text-left"
      onClick={onClick}
      variant={isActive ? "secondary" : "outline"}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          colorClass,
        )}
      >
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg">{count}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
      <ArrowUpRightIcon
        className={cn(
          "size-3.5 shrink-0",
          isActive
            ? "text-primary"
            : "text-muted-foreground/40 group-hover:text-muted-foreground",
        )}
      />
    </Button>
  );
}
