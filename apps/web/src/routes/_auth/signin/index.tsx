import { createFileRoute } from "@tanstack/react-router";

import SignInForm from "./-components/sign-in-form";

export const Route = createFileRoute("/_auth/signin/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Sign In • Grepedia" },
      {
        content:
          "Sign in to Grepedia to manage your profile, tools, bookmarks, and account settings.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <SignInForm />
    </main>
  );
}
