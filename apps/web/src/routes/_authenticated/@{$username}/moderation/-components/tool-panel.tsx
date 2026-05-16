import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useState } from "react";

import { AppLink } from "@/components/app-link";
import { globalBannerStore } from "@/lib/global-banner-store";
import { getErrorMessage } from "@/utils/get-error-message";

import { useModeratorGetTool } from "../-queries/moderator-get-tool";
import { useModeratorUpdateTool } from "../-queries/moderator-update-tool";

interface ToolPanelProps {
  identifier: string;
  tool: NonNullable<ReturnType<typeof useModeratorGetTool>["data"]>;
}

type ToolStatus = ToolPanelProps["tool"]["status"];

export function ToolPanel({ identifier, tool }: ToolPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<ToolStatus>(tool.status);

  const { isPending: isUpdating, mutate: updateTool } =
    useModeratorUpdateTool(identifier);

  const handleUpdate = () => {
    updateTool(
      { slug: identifier, status: selectedStatus },
      {
        onError: (error) => {
          globalBannerStore.add({
            description: getErrorMessage(error),
            title: "Couldn't update tool",
            variant: "destructive",
          });
        },
        onSuccess: ({ data }) => {
          setSelectedStatus(data.tool.status);
          globalBannerStore.add({
            description: `Tool ${data.tool.slug} updated successfully.`,
            title: "Tool updated",
            variant: "success",
          });
        },
      },
    );
  };

  return (
    <div className="grid gap-3 border p-4 text-sm">
      <div className="grid gap-1">
        <AppLink params={{ slug: tool.slug }} to="/tools/@{$slug}">
          {tool.name}
        </AppLink>
        <p className="text-muted-foreground">{tool.shortDescription}</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="moderator-change-tool-status">Tool Status</Label>
        <Select
          onValueChange={(value) => setSelectedStatus(value as ToolStatus)}
          value={selectedStatus}
        >
          <SelectTrigger id="moderator-change-tool-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        disabled={selectedStatus === tool.status || isUpdating}
        onClick={handleUpdate}
      >
        {isUpdating ? "Updating..." : "Save Tool Changes"}
      </Button>
    </div>
  );
}
