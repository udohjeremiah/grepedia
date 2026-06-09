import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import { FileXIcon, ListChecksIcon, PlusIcon } from "lucide-react";

import { List } from "@/routes/lists/-components/list";
import { useLists } from "@/routes/lists/-queries/lists";

export function UserLists() {
  const { userId } = useRouteContext({ from: "/_authenticated" });

  const { data: lists } = useLists({ createdBy: userId });

  return (
    <div className="flex flex-1 flex-col gap-6 border p-6">
      <div className="flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <ListChecksIcon className="size-5" />
        </div>
        <div className="flex w-full justify-between gap-4 max-sm:flex-col">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Lists</h3>
            <p className="text-sm text-muted-foreground">
              Draft, publish, and archive curated tool collections.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/lists/new">
              <PlusIcon />
              Create List
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
      {lists.length > 0 ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {lists.map((list) => (
            <li key={list._id}>
              <List {...list} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileXIcon className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No curated lists</EmptyTitle>
            <EmptyDescription>
              Create your first curated list to organize and share tool
              collections.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
