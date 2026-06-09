import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/utils/get-session";

import { SaveListForm } from "../-components/save-list-form";

export const Route = createFileRoute("/lists/new/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ replace: true, to: "/signin" });
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Create Curated List • Grepedia" },
      {
        content: "Create a curated list of Grepedia tools.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="flex flex-1 p-4 sm:px-8 md:px-16">
      <div className="flex size-full flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Create curated list
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Drafts are private. Published lists are public and locked from
            edits.
          </p>
        </div>
        <SaveListForm />
      </div>
    </main>
  );
}
