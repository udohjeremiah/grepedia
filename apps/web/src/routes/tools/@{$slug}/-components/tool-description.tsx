import { useParams } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";

import { MarkdownPreview } from "@/components/markdown";

import { useTool } from "../-queries/tool";

export default function ToolDescription() {
  const { slug } = useParams({ from: "/tools/@{$slug}" });

  const { data: tool } = useTool({ slug });

  return (
    <div className="flex flex-col gap-4 border p-6">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <FileTextIcon className="size-3.5" />
        About
      </div>
      <MarkdownPreview value={tool.longDescription} />
    </div>
  );
}
