import { createFileRoute } from "@tanstack/react-router";

import RequestPasswordResetForm from "./-components/request-password-reset-form";

export const Route = createFileRoute("/(auth)/request-password-reset/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Reset Password • Grepedia" },
      {
        content:
          "Request a password reset link to regain access to your Grepedia account.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <main className="w-full max-w-sm">
      <RequestPasswordResetForm />
    </main>
  );
}
