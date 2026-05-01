import { createFileRoute, notFound } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";

import { getSession } from "@/utils/get-session";

import Moderation from "./-components/moderation";

export const Route = createFileRoute(
  "/_authenticated/@{$username}/moderation/",
)({
  beforeLoad: async () => {
    const session = await getSession();
    const role = session?.user.role;

    if (!role || role !== "moderator") throw notFound();
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Moderation • Grepedia" },
      {
        content:
          "Manage role progression, moderation queue, and flagged activity on Grepedia.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex p-4 sm:px-8 md:px-0 md:py-6">
      <div className="flex flex-1 flex-col gap-6 border p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Moderation</h3>
          <p className="text-sm text-muted-foreground">
            Appeals and moderation requests start on Discord. Moderators can
            review users, tools, and comments here by selecting a target and
            fetching by identifier.
          </p>
        </div>
        <Separator />
        <Moderation />
      </div>
    </main>
  );
}
