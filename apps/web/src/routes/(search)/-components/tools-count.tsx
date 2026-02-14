import { useToolsCount } from "../-queries/tools-count";

export default function ToolsCount() {
  const { data: toolsCount } = useToolsCount();

  return (
    <hgroup className="flex flex-col items-center">
      <h3 className="text-xs text-muted-foreground">Tools in Grepedia</h3>
      <p className="font-medium">
        {new Intl.NumberFormat().format(toolsCount)}
      </p>
    </hgroup>
  );
}
