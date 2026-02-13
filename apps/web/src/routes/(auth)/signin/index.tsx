import { createFileRoute } from "@tanstack/react-router";

import SignInForm from "./-components/sign-in-form";

export const Route = createFileRoute("/(auth)/signin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <SignInForm />
    </main>
  );
}
