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

import type { Session } from "@/lib/auth-client";

import { globalBannerStore } from "@/lib/global-banner-store";
import { getErrorMessage } from "@/utils/get-error-message";

import { useModeratorGetUser } from "../-queries/moderator-get-user";
import { useModeratorUpdateUser } from "../-queries/moderator-update-user";

interface UserPanelProps {
  identifier: string;
  user: NonNullable<ReturnType<typeof useModeratorGetUser>["data"]>;
}

type UserRole = Session["user"]["role"];
type UserStatus = Session["user"]["status"];

export function UserPanel({ identifier, user }: UserPanelProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.status);

  const { isPending: isUpdating, mutate: updateUser } =
    useModeratorUpdateUser(identifier);

  const handleUpdate = () => {
    updateUser(
      { role: selectedRole, status: selectedStatus, username: identifier },
      {
        onError: (error) => {
          globalBannerStore.add({
            description: getErrorMessage(error),
            title: "Couldn't update user",
            variant: "destructive",
          });
        },
        onSuccess: ({ data }) => {
          setSelectedRole(data.user.role);
          setSelectedStatus(data.user.status);
          globalBannerStore.add({
            description: `@${data.user.username} updated successfully.`,
            title: "User updated",
            variant: "success",
          });
        },
      },
    );
  };

  const isUnchanged =
    selectedRole === user.role && selectedStatus === user.status;

  return (
    <div className="grid gap-3 border p-4 text-sm">
      <div className="grid gap-2 border bg-muted/50 p-3 text-xs">
        <p className="font-semibold text-muted-foreground uppercase">
          Contributions
        </p>
        <div className="grid gap-1 sm:grid-cols-2">
          <p>Tools added: {user.contributions.toolsAdded}</p>
          <p>Tools updated: {user.contributions.toolsUpdated}</p>
          <p>Tool comments: {user.contributions.toolComments}</p>
          <p>Tool reactions: {user.contributions.toolReactions}</p>
          <p>Total contributions: {user.contributions.total}</p>
        </div>
      </div>
      {user.trustProfile && (
        <div className="grid gap-2 border bg-muted/50 p-3 text-xs">
          <p className="font-semibold text-muted-foreground uppercase">
            Trust Profile
          </p>
          <div className="grid gap-1 sm:grid-cols-2">
            <p>Risk level: {user.trustProfile.riskLevel}</p>
            <p>
              Scores: trust {user.trustProfile.scores.trust} / bot{" "}
              {user.trustProfile.scores.botRisk}
            </p>
            <p>Recommended role: {user.trustProfile.recommendations.role}</p>
            <p>
              Recommended status: {user.trustProfile.recommendations.status}
            </p>
            <p className="sm:col-span-2">
              Reasons: {user.trustProfile.reasons.join(", ")}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="grid gap-2">
          <Label htmlFor="moderator-change-role">Role</Label>
          <Select
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            value={selectedRole}
          >
            <SelectTrigger id="moderator-change-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="moderator-change-status">Status</Label>
          <Select
            onValueChange={(value) => setSelectedStatus(value as UserStatus)}
            value={selectedStatus}
          >
            <SelectTrigger id="moderator-change-status">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        disabled={!identifier.trim() || isUnchanged || isUpdating}
        onClick={handleUpdate}
      >
        {isUpdating ? "Updating..." : "Save User Changes"}
      </Button>
    </div>
  );
}
