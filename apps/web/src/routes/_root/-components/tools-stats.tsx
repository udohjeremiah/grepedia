import { Separator } from "@workspace/ui/components/separator";
import { Fragment } from "react";

import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsStats } from "../-queries/tools-stats";

export function ToolsStats() {
  const { data } = useToolsStats();

  const stats = [
    { label: "Tools", value: data.tools },
    { label: "Contributors", value: data.contributors },
    { label: "Reviews", value: data.reviews },
  ];

  return (
    <div className="flex items-center gap-4">
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 && <Separator orientation="vertical" />}
          <hgroup className="flex flex-col items-center">
            <h3 className="text-xs text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-semibold">
              {formatCompactNumber(stat.value)}
            </p>
          </hgroup>
        </Fragment>
      ))}
    </div>
  );
}
