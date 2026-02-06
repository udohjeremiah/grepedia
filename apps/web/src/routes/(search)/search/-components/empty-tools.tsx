import { auth } from "@/hooks/auth";
import { Link, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { SearchXIcon } from "lucide-react";

export default function EmptyTools() {
  const searchParams = useSearch({ from: "/(search)/search/" });
  const { data: sessionData } = auth.useSession();

  const tab = searchParams.tab;

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No tools matched this tab</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any results in the {tab} tab for this search.
          Try viewing all tools or add a new one if you know it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild>
          <Link to="/search" search={searchParams}>
            View All Tools
          </Link>
        </Button>
        <Button asChild variant="outline">
          {sessionData ? (
            <Link
              to="/@{$username}/add-tool"
              params={{ username: sessionData.user.username }}
            >
              Add a Tool
            </Link>
          ) : (
            <Link to="/signin">Add a Tool</Link>
          )}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
