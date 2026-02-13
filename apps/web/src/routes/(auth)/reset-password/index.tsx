import { createFileRoute, notFound } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import ResetPasswordForm from "./-components/reset-password-form";

const searchParamsValidator = zodValidator(
  z.object({
    error: z.string().optional(),
    token: z.string().optional(),
  }),
);

export const Route = createFileRoute("/(auth)/reset-password/")({
  beforeLoad: ({ search }) => {
    if (search.error || !search.token) throw notFound();
  },
  component: RouteComponent,
  validateSearch: searchParamsValidator,
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
