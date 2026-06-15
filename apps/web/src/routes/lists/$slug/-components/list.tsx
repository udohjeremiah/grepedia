import { Link, useParams } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/cn";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  PencilIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react";

import { MarkdownPreview } from "@/components/markdown";
import { categoryVariants } from "@/constants/category";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { globalBannerStore } from "@/lib/global-banner-store";
import { getInitials } from "@/utils/get-initials";

import { useList } from "../-queries/list";
import { useListSetReaction } from "../-queries/list-set-reaction";
import { ArchiveListDialog } from "../../-components/archive-list-dialog";
import { DeleteListDialog } from "../../-components/delete-list-dialog";

export function List() {
  const { slug } = useParams({ from: "/lists/$slug" });

  const { user } = auth.useSession();

  const { data: list } = useList({ slug });
  const { isPending: isReacting, mutate: setListReaction } =
    useListSetReaction(slug);

  const handleSetListReaction = (value: -1 | 1) => {
    if (!user) return globalThis.location.assign("/signin");
    setListReaction({ value });
  };

  const isOwner = user?.id === list.createdBy;

  const statusInfo = {
    archived: {
      date: list.archivedAt!,
      label: "Archived",
    },
    draft: {
      date: list.updatedAt ?? list.createdAt,
      label: list.updatedAt ? "Updated" : "Created",
    },
    published: {
      date: list.publishedAt!,
      label: "Published",
    },
  }[list.status];

  return (
    <article className="mx-auto flex max-w-6xl flex-1 flex-col gap-6">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {list.isOfficial ? (
            <Badge variant="info">
              <SparklesIcon className="size-3" />
              Featured
            </Badge>
          ) : (
            <Badge
              variant={list.status === "published" ? "success" : "secondary"}
            >
              {list.status}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {list.tools.length} {list.tools.length === 1 ? "tool" : "tools"}
          </span>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {list.title}
          </h2>
          <MarkdownPreview
            className="text-base text-muted-foreground md:text-lg"
            value={list.description}
          />
        </div>
        {!list.isOfficial && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                {statusInfo.label}{" "}
                {format(new Date(statusInfo.date), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <EyeIcon className="size-4" />
                {list.stats.views}
              </span>
            </div>
            {isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                {list.status === "draft" ? (
                  <>
                    <Button asChild variant="outline">
                      <Link params={{ slug }} to="/lists/$slug/edit">
                        <PencilIcon />
                        Edit Draft
                      </Link>
                    </Button>
                    <DeleteListDialog />
                  </>
                ) : (
                  <>
                    <ArchiveListDialog
                      isArchived={list.status === "archived"}
                    />
                    <Button onClick={handleShare} variant="outline">
                      <Share2Icon />
                      Share
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </header>
      <Separator />
      {!list.isOfficial && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className={cn(
              list.relations?.reaction === 1 && "border-primary text-primary",
            )}
            disabled={isReacting}
            onClick={() => handleSetListReaction(1)}
            variant="outline"
          >
            <ArrowUpIcon />
            {list.stats.upvotes}
          </Button>
          <Button
            className={cn(
              list.relations?.reaction === -1 &&
                "border-destructive text-destructive",
            )}
            disabled={isReacting}
            onClick={() => handleSetListReaction(-1)}
            variant="outline"
          >
            <ArrowDownIcon />
            {list.stats.downvotes}
          </Button>
        </div>
      )}
      <ToolList tools={list.tools} />
      <JsonLdScript list={list} />
    </article>
  );
}

async function handleShare() {
  await navigator.clipboard.writeText(globalThis.location.href);
  globalBannerStore.add({
    description: "The list URL has been copied to your clipboard.",
    title: "Link copied",
    variant: "success",
  });
}

function JsonLdScript({ list }: { list: ReturnType<typeof useList>["data"] }) {
  return (
    <script
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          description: list.description,
          itemListElement: list.tools.map((tool, index) => ({
            "@type": "ListItem",
            name: tool.name,
            position: index + 1,
            url: `${env.VITE_BASE_URL}/tools/@${tool.slug}`,
          })),
          name: list.title,
        }),
      }}
      type="application/ld+json"
    />
  );
}

function ToolList({
  tools,
}: {
  tools: ReturnType<typeof useList>["data"]["tools"];
}) {
  return (
    <ol className="space-y-4">
      {tools.map((tool, index) => (
        <li
          className="group flex gap-4 border bg-background p-4 transition duration-200 hover:-translate-y-0.5 hover:border-foreground/30 max-sm:flex-col"
          key={tool._id}
        >
          <div className="flex gap-4 max-sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold">
              {index + 1}
            </span>
            <Avatar className="size-12 rounded-none after:border-none">
              <AvatarImage
                alt={tool.name}
                className="rounded-none"
                src={`https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`}
              />
              <AvatarFallback className="rounded-none">
                {getInitials(tool.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h2 className="font-semibold tracking-tight">{tool.name}</h2>
              <p className="text-sm text-muted-foreground">
                {tool.shortDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tool.categories.map((category, index) => (
                <Badge key={category} variant={categoryVariants[index]}>
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <Button asChild className="shrink-0" variant="outline">
            <Link params={{ slug: tool.slug }} to="/tools/@{$slug}">
              View
            </Link>
          </Button>
        </li>
      ))}
    </ol>
  );
}
