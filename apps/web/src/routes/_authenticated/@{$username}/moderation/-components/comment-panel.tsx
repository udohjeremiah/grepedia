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

import { globalBannerStore } from "@/lib/global-banner-store";
import { getErrorMessage } from "@/utils/get-error-message";

import { useModeratorGetComment } from "../-queries/moderator-get-comment";
import { useModeratorUpdateComment } from "../-queries/moderator-update-comment";

interface CommentPanelProps {
  comment: NonNullable<ReturnType<typeof useModeratorGetComment>["data"]>;
  identifier: string;
}

type CommentStatus = CommentPanelProps["comment"]["status"];

export function CommentPanel({ comment, identifier }: CommentPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<CommentStatus>(
    comment.status,
  );

  const { isPending: isUpdating, mutate: updateComment } =
    useModeratorUpdateComment(identifier);

  const handleUpdate = () => {
    updateComment(
      { commentId: identifier, status: selectedStatus },
      {
        onError: (error) => {
          globalBannerStore.add({
            description: getErrorMessage(error),
            title: "Couldn't update comment",
            variant: "destructive",
          });
        },
        onSuccess: ({ data }) => {
          setSelectedStatus(data.comment.status);
          globalBannerStore.add({
            description: `Comment ${data.comment._id} updated successfully.`,
            title: "Comment updated",
            variant: "success",
          });
        },
      },
    );
  };

  return (
    <div className="grid gap-3 border p-4 text-sm">
      <p className="text-xs text-muted-foreground">
        Tool: {comment.toolSlug} • Author: @{comment.user.username}
      </p>
      <div className="border bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          {comment.parentCommentId ? "Reply" : "Top-level comment"}
        </p>
        <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="moderator-change-comment-status">Comment Status</Label>
        <Select
          onValueChange={(value) => setSelectedStatus(value as CommentStatus)}
          value={selectedStatus}
        >
          <SelectTrigger id="moderator-change-comment-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        disabled={selectedStatus === comment.status || isUpdating}
        onClick={handleUpdate}
      >
        {isUpdating ? "Updating..." : "Save Comment Changes"}
      </Button>
    </div>
  );
}
