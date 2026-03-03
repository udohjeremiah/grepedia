import { createFileRoute } from "@tanstack/react-router";

import SignupForm from "./-components/sign-up-form";

export const Route = createFileRoute("/(auth)/signup/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Create Account — Grepedia" },
      {
        content:
          "Create your Grepedia account to contribute tools, share feedback, and build your public profile.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <SignupForm />
    </main>
  );
}
