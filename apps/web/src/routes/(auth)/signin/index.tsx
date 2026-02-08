import { createFileRoute } from "@tanstack/react-router";

import SigninForm from "./-components/signin-form";

export const Route = createFileRoute("/(auth)/signin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <SigninForm />
    </main>
  );
}
