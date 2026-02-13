import { createFileRoute } from "@tanstack/react-router";

import SignupForm from "./-components/sign-up-form";

export const Route = createFileRoute("/(auth)/signup/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <SignupForm />
    </main>
  );
}
