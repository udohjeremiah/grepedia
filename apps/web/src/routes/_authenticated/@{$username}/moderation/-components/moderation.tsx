import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { UserRoundXIcon } from "lucide-react";
import { useState } from "react";

import { Session } from "@/lib/auth-client";
import { getErrorMessage } from "@/utils/get-error-message";
import { globalBanner } from "@/utils/global-banner";

import { useModeratorGetUser } from "../-queries/moderator-get-user";
import { useModeratorUpdateUser } from "../-queries/moderator-update-user";

type UserRole = Session["user"]["role"];
type UserStatus = Session["user"]["status"];

export default function Moderation() {
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>();
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>();

  const {
    data: user,
    isFetching: isGettingUser,
    refetch,
  } = useModeratorGetUser({ username }, false);
  const { isPending: isUpdatingUser, mutate: updateUser } =
    useModeratorUpdateUser(username);

  const handleGetUser = async () => {
    try {
      const fetchedUser = await refetch();

      const role = fetchedUser.data?.role;
      const status = fetchedUser.data?.status;

      setSelectedRole(role);
      setSelectedStatus(status);

      globalBanner.emit({
        banner: {
          description: `Successfully fetched user @${username}.`,
          title: "User fetched",
          variant: "success",
        },
        type: "add",
      });
    } catch (error) {
      globalBanner.emit({
        banner: {
          description: getErrorMessage(error),
          title: "User lookup failed",
          variant: "warning",
        },
        type: "add",
      });
    }
  };

  const handleUpdateUser = () => {
    updateUser(
      {
        role: selectedRole,
        status: selectedStatus,
        username,
      },
      {
        onError: (error) => {
          globalBanner.emit({
            banner: {
              description: getErrorMessage(error),
              title: "Couldn't update user",
              variant: "warning",
            },
            type: "add",
          });
        },

        onSuccess: (data) => {
          const updatedUser = data.data.user;
          const role = updatedUser.role;

          setSelectedRole(role);
          setSelectedStatus(updatedUser.status);

          globalBanner.emit({
            banner: {
              description: `@${updatedUser.username} was updated successfully.`,
              title: "User updated",
              variant: "success",
            },
            type: "add",
          });
        },
      },
    );
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="moderator-user-lookup">Username</Label>
        <div className="flex items-center gap-2 max-sm:flex-col">
          <Input
            id="moderator-user-lookup"
            onChange={(event) => {
              setUsername(event.target.value);
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
            }}
            placeholder="Enter a username"
            value={username}
          />
          <Button
            className="max-sm:w-full"
            disabled={isGettingUser || username.trim().length === 0}
            onClick={() => handleGetUser()}
          >
            {isGettingUser ? "Fetching..." : "Fetch User"}
          </Button>
        </div>
      </div>
      {user ? (
        <div className="grid gap-3 rounded-md border p-4 text-sm">
          <div className="grid gap-2 rounded-md border bg-muted/50 p-3 text-xs">
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
            <div className="grid gap-2 rounded-md border bg-muted/50 p-3 text-xs">
              <p className="font-semibold text-muted-foreground uppercase">
                Trust Profile
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                <p>Risk level: {user.trustProfile.riskLevel}</p>
                <p>
                  Scores: trust {user.trustProfile.scores.trust} / bot{" "}
                  {user.trustProfile.scores.botRisk}
                </p>
                <p>
                  Recommended role: {user.trustProfile.recommendations.role}
                </p>
                <p>
                  Recommended status: {user.trustProfile.recommendations.status}
                </p>
                <p className="sm:col-span-2">
                  Reasons: {user.trustProfile.reasons.join(", ")}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
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
                onValueChange={(value) =>
                  setSelectedStatus(value as UserStatus)
                }
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
            disabled={
              isUpdatingUser ||
              (!selectedRole && !selectedStatus) ||
              username.trim().length === 0
            }
            onClick={() => handleUpdateUser()}
          >
            {isUpdatingUser ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundXIcon className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No user selected</EmptyTitle>
            <EmptyDescription>
              Enter a username above and click &quot;Fetch User&quot; to view
              and manage their details.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
