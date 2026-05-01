import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import ResetPasswordForm from "./-components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-password/")({
  beforeLoad: ({ search }) => {
    if (search.error || !search.token) throw notFound();
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Set New Password • Grepedia" },
      {
        content: "Set a new password for your Grepedia account.",
        name: "description",
      },
    ],
  }),
  validateSearch: z.object({
    error: z.string().optional(),
    token: z.string().optional(),
  }),
});

function RouteComponent() {
  const { token } = Route.useSearch();

  if (!token) return;

  return (
    <main className="w-full max-w-sm">
      <ResetPasswordForm token={token} />
    </main>
  );
}
