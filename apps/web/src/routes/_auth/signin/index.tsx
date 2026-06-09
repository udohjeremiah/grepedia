import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/utils/get-session";

import { SignInForm } from "./-components/sign-in-form";

export const Route = createFileRoute("/_auth/signin/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({
        params: { username: session.user.displayUsername },
        replace: true,
        to: "/@{$username}",
      });
    }
  },
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
