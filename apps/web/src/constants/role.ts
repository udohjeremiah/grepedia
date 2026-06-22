import type { User } from "@workspace/shared/schemas/users/user";

export const roleConfig: Record<
  User["role"],
  {
    color: string;
    description: string;
    label: string;
  }
> = {
  contributor: {
    color: "text-blue-500",
    description: "Can submit tools and lists for the community.",
    label: "Contributor",
  },
  member: {
    color: "text-muted-foreground",
    description:
      "Standard account with access to browse, bookmark, and react to tools and lists.",
    label: "Member",
  },
  moderator: {
    color: "text-violet-500",
    description: "Can moderate content and user submissions.",
    label: "Moderator",
  },
} as const;

export const roleVariants: Record<
  User["role"],
  | "default"
  | "destructive"
  | "ghost"
  | "info"
  | "link"
  | "outline"
  | "secondary"
  | "success"
  | "warning"
> = {
  contributor: "warning",
  member: "secondary",
  moderator: "default",
} as const;
