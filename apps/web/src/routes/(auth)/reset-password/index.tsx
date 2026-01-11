import { createFileRoute, notFound } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import ResetPasswordForm from "./-components/reset-password-form";
import { z } from "zod";

const searchParamsSchema = zodValidator(
  z.object({
    error: z.string().optional(),
    token: z.string().optional(),
  }),
);

export const Route = createFileRoute("/(auth)/reset-password/")({
  validateSearch: searchParamsSchema,
  beforeLoad: ({ search }) => {
    if (search.error || !search.token) {
      notFound({ throw: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();

  if (!token) return;

  return (
    <div className="w-full max-w-sm">
      <ResetPasswordForm token={token} />
    </div>
  );
}
