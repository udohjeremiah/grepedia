import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { SearchIcon } from "lucide-react";

interface LookupBarProps {
  identifier: string;
  isFetching: boolean;
  onFetch: () => void;
  onIdentifierChange: (value: string) => void;
  onTargetChange: (value: ModerationTarget) => void;
  target: ModerationTarget;
}

type ModerationTarget = "comment" | "tool" | "user";

const labelByTarget: Record<ModerationTarget, string> = {
  comment: "Comment ID",
  tool: "Tool Slug",
  user: "Username",
};

const placeholderByTarget: Record<ModerationTarget, string> = {
  comment: "Enter comment id",
  tool: "Enter tool slug",
  user: "Enter username",
};

export default function LookupBar({
  identifier,
  isFetching,
  onFetch,
  onIdentifierChange,
  onTargetChange,
  target,
}: LookupBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        <Label htmlFor="moderation-target">Target</Label>
        <Select onValueChange={onTargetChange} value={target}>
          <SelectTrigger id="moderation-target">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="moderation-lookup">{labelByTarget[target]}</Label>
        <Input
          id="moderation-lookup"
          onChange={(event) => onIdentifierChange(event.target.value)}
          placeholder={placeholderByTarget[target]}
          value={identifier}
        />
      </div>
      <Button disabled={!identifier.trim() || isFetching} onClick={onFetch}>
        <SearchIcon />
        {isFetching ? "Fetching..." : `Fetch ${target}`}
      </Button>
    </div>
  );
}
