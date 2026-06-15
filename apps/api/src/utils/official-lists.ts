export const OFFICIAL_LISTS = [
  {
    description: "The top tools launched today.",
    period: "today",
    slug: "today",
    title: "Today's Top Products",
  },
  {
    description: "The top tools launched yesterday.",
    period: "yesterday",
    slug: "yesterday",
    title: "Yesterday's Top Products",
  },
  {
    description: "The top tools launched in the past week.",
    period: "week",
    slug: "week",
    title: "Last Week's Top Products",
  },
  {
    description: "The top tools launched in the past month.",
    period: "month",
    slug: "month",
    title: "Last Month's Top Products",
  },
] as const;

export function getOfficialListBySlug(slug: string) {
  return OFFICIAL_LISTS.find((list) => list.slug === slug);
}

export function getPeriodEnd(period: "month" | "today" | "week" | "yesterday") {
  if (period === "today") {
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  if (period === "yesterday") {
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  // eslint-disable-next-line sonarjs/no-redundant-jump
  return;
}

export function getPeriodStart(
  period: "month" | "today" | "week" | "yesterday",
) {
  const now = new Date();

  if (period === "today") {
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }

  if (period === "yesterday") {
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - 1);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }

  if (period === "week") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}
