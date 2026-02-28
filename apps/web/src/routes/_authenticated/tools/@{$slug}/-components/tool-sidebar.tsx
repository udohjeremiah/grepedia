import type { ReactNode } from "react";

import { useParams } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  FolderOpenIcon,
  GlobeIcon,
  type LucideIcon,
  RefreshCwIcon,
  TagIcon,
  UserCircleIcon,
} from "lucide-react";

import { categoryVariants } from "@/constants/category";
import { getInitials } from "@/utils/get-initials";

import { useTool } from "../-queries/tool";

export default function ToolSidebar() {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}/" });
  const { data: tool } = useTool({ slug });

  return (
    <aside>
      <div className="flex flex-col gap-5 rounded-lg border p-5">
        <SidebarSection icon={FolderOpenIcon} title="Categories">
          <div className="flex flex-wrap gap-2">
            {tool.categories.map((category, index) => (
              <Badge key={category} variant={categoryVariants[index]}>
                {category}
              </Badge>
            ))}
          </div>
        </SidebarSection>
        <Separator />
        <SidebarSection icon={TagIcon} title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </SidebarSection>
        <Separator />
        <SidebarSection icon={UserCircleIcon} title="People">
          <div className="flex flex-col gap-2.5">
            {tool.owner && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-mono">@{tool.owner}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Added by</span>
              <span className="font-mono">@{tool.addedBy}</span>
            </div>
            {tool.updatedBy && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Updated by</span>
                <span className="font-mono">@{tool.updatedBy}</span>
              </div>
            )}
          </div>
        </SidebarSection>
        <Separator />
        <SidebarSection icon={CalendarIcon} title="Timeline">
          <div className="flex flex-col gap-2.5">
            {tool.releasedAt && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <GlobeIcon className="size-3" />
                  Released
                </span>
                <span>{format(new Date(tool.releasedAt), "MMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ClockIcon className="size-3" />
                Added
              </span>
              <span>{format(new Date(tool.addedAt), "MMM d, yyyy")}</span>
            </div>
            {tool.updatedAt && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <RefreshCwIcon className="size-3" />
                  Updated
                </span>
                <span>
                  {formatDistanceToNow(new Date(tool.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>
        </SidebarSection>
        {tool.externalUrls && tool.externalUrls.length > 0 && (
          <>
            <Separator />
            <SidebarSection icon={ExternalLinkIcon} title="Links">
              <div className="flex flex-col gap-1.5">
                {tool.externalUrls.map((externalUrl) => (
                  <Button
                    asChild
                    className="gap-2.5 rounded-md"
                    key={externalUrl.url}
                    variant="outline"
                  >
                    <a href={externalUrl.url} rel="noreferrer" target="_blank">
                      <Avatar size="sm">
                        <AvatarImage
                          alt={externalUrl.platform}
                          src={`https://www.google.com/s2/favicons?domain=${externalUrl.platform}&sz=64`}
                        />
                        <AvatarFallback className="text-base">
                          {getInitials(externalUrl.platform)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">
                        {externalUrl.platform}
                      </span>
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  </Button>
                ))}
              </div>
            </SidebarSection>
          </>
        )}
        <Separator />
        <Button
          asChild
          className="gap-2 rounded-md bg-primary/5 text-primary hover:bg-primary/10"
        >
          <a href={tool.officialUrl} rel="noreferrer" target="_blank">
            <GlobeIcon />
            <span className="flex-1 truncate">{tool.officialUrl}</span>
            <ExternalLinkIcon className="size-3" />
          </a>
        </Button>
      </div>
    </aside>
  );
}

function SidebarSection({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}
