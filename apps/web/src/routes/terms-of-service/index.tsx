import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Terms Of Service — Grepedia" },
      {
        content:
          "Review Grepedia's Terms of Service for rules, responsibilities, and platform usage guidelines.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return <div>Hello /terms-of-service/!</div>;
}
