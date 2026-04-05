import { formatCompactNumber } from "@/utils/format-compact-number";

import { useToolsCount } from "../-queries/tools-count";

export default function ToolsCount() {
  const { data: toolsCount } = useToolsCount();

  return (
    <hgroup className="flex flex-col items-center text-center">
      <h3 className="text-xs text-muted-foreground">Tools in Grepedia</h3>
      <p className="text-3xl font-semibold">
        {formatCompactNumber(toolsCount)}
      </p>
    </hgroup>
  );
}
