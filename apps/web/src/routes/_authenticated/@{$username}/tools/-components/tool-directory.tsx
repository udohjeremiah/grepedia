import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/utils/cn";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2Icon,
  FolderIcon,
  FolderOpenIcon,
  type LucideIcon,
  MessageSquareIcon,
  PackageIcon,
  PenLineIcon,
  PlusIcon,
  SearchXIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useUserTools } from "../-queries/user-tools";

type RelationKey = keyof UserTool["relations"];

interface ToolDirectoryProps {
  searchQuery: string;
  tools: UserTool[];
}

type UserTool = ReturnType<typeof useUserTools>["data"]["tools"][number];

const relationGroups: Array<{
  icon: LucideIcon;
  key: RelationKey;
  label: string;
}> = [
  { icon: PackageIcon, key: "owned", label: "Owned" },
  { icon: PlusIcon, key: "added", label: "Added" },
  { icon: PenLineIcon, key: "updated", label: "Updated" },
  { icon: ThumbsUpIcon, key: "upvoted", label: "Upvoted" },
  { icon: ThumbsDownIcon, key: "downvoted", label: "Downvoted" },
  { icon: MessageSquareIcon, key: "commented", label: "Commented" },
];

const categoryVariants = ["success", "info", "warning", "destructive"] as const;

export default function ToolDirectory({
  searchQuery,
  tools,
}: ToolDirectoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTool, setSelectedTool] = useState<UserTool>();

  const groupedByCategory = useMemo(() => {
    const categoryMap = new Map<string, UserTool[]>();

    for (const tool of tools) {
      for (const category of tool.categories) {
        const current = categoryMap.get(category) ?? [];
        current.push(tool);
        categoryMap.set(category, current);
      }
    }

    return (
      [...categoryMap.entries()]
        .map(([category, categoryTools]) => ({
          category,
          tools: categoryTools,
        }))
        // eslint-disable-next-line unicorn/no-array-sort
        .sort((a, b) => a.category.localeCompare(b.category))
    );
  }, [tools]);

  const effectiveExpanded = searchQuery
    ? new Set(groupedByCategory.map((group) => group.category))
    : expandedCategories;

  function toggleCategory(category: string) {
    if (searchQuery) return;

    setExpandedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  if (groupedByCategory.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {searchQuery.trim() ? (
              <SearchXIcon className="text-muted-foreground" />
            ) : (
              <XIcon className="text-muted-foreground" />
            )}
          </EmptyMedia>
          <EmptyTitle>
            {searchQuery.trim() ? "No tools match your search" : "No tools yet"}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery.trim()
              ? "Try a different keyword for tool names, descriptions, categories, or tags."
              : "Contribute to or interact with tools to find them quickly later."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        {groupedByCategory.map((group, groupIndex) => {
          const isExpanded = effectiveExpanded.has(group.category);

          return (
            <div key={group.category}>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-secondary/50",
                  groupIndex > 0 && "border-t",
                )}
                onClick={() => toggleCategory(group.category)}
              >
                {isExpanded ? (
                  <>
                    <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                    <FolderOpenIcon className="size-4 text-info" />
                  </>
                ) : (
                  <>
                    <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                    <FolderIcon className="size-4 text-info" />
                  </>
                )}
                <span className="text-sm font-medium text-foreground">
                  {group.category}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {group.tools.length}{" "}
                  {group.tools.length === 1 ? "tool" : "tools"}
                </span>
              </button>
              {isExpanded && (
                <div className="border-t">
                  {group.tools.map((tool, toolIndex) => (
                    <div key={`${group.category}-${tool._id}`}>
                      <button
                        className={cn(
                          "flex w-full flex-wrap items-center gap-2.5 py-2 pr-4 pl-11 text-left transition-colors hover:bg-secondary/40",
                          toolIndex > 0 && "border-t",
                        )}
                        onClick={() => setSelectedTool(tool)}
                      >
                        <FileCode2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm text-foreground">
                          {tool.name}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                          <span className="flex items-center gap-1">
                            <ThumbsUpIcon className="size-3" />
                            {tool.stats.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDownIcon className="size-3" />
                            {tool.stats.downvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquareIcon className="size-3" />
                            {tool.stats.comments}
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setSelectedTool(undefined);
        }}
        open={selectedTool !== undefined}
      >
        {selectedTool && (
          <DialogContent className="max-w-md">
            <DialogHeader className="min-w-0 flex-row items-center gap-3">
              <Avatar size="lg">
                <AvatarImage alt={selectedTool.name} src={selectedTool.image} />
                <AvatarFallback>
                  {selectedTool.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <DialogTitle className="truncate">
                  {selectedTool.name}
                </DialogTitle>
                <DialogDescription className="truncate">
                  {selectedTool.shortDescription}
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {selectedTool.categories.map((category, index) => (
                  <Badge key={category} variant={categoryVariants[index]}>
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Upvotes" value={selectedTool.stats.upvotes} />
                <StatTile
                  label="Downvotes"
                  value={selectedTool.stats.downvotes}
                />
                <StatTile
                  label="Comments"
                  value={selectedTool.stats.comments}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {relationGroups.map(
                  (group) =>
                    selectedTool.relations[group.key] && (
                      <Badge key={group.key} variant="secondary">
                        {group.label}
                      </Badge>
                    ),
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-mono text-foreground">
                    {selectedTool.owner ? `@${selectedTool.owner}` : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Added</span>
                  <span className="text-foreground">
                    {format(new Date(selectedTool.addedAt), "MMMM d, yyyy")}
                  </span>
                </div>
                {selectedTool.updatedAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="text-foreground">
                        {format(
                          new Date(selectedTool.updatedAt),
                          "MMMM d, yyyy",
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button asChild>
                <Link params={{ slug: selectedTool.slug }} to="/tools/@{$slug}">
                  View Details
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-secondary/50 p-3 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
