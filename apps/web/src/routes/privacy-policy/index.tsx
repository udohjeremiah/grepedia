import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Grepedia" },
      {
        content:
          "Read Grepedia's Privacy Policy to understand how your data is collected, used, and protected.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return <div>Hello /privacy-policy/!</div>;
}
