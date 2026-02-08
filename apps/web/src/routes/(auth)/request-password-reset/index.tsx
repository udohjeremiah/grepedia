import { createFileRoute } from "@tanstack/react-router";

import RequestPasswordResetForm from "./-components/request-password-reset-form";

export const Route = createFileRoute("/(auth)/request-password-reset/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <RequestPasswordResetForm />
    </main>
  );
}
