import { useParams } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { AlertTriangleIcon, FileArchiveIcon } from "lucide-react";

import { SubmissionAlert } from "@/components/submission-alert";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";

import { useToggleArchiveList } from "../-queries/user-toggle-archive-list";

interface ArchiveListDialogProps {
  isArchived?: boolean;
}

export function ArchiveListDialog({
  isArchived = false,
}: ArchiveListDialogProps) {
  const { slug } = useParams({ from: "/lists/$slug" });

  const { isPending: isTogglingArchive, mutate: toggleArchiveList } =
    useToggleArchiveList();

  const { resetStatus, setApiError, status } = useSubmission();

  const { handleOpenChange, isOpen, setIsOpen } = useDialog({
    onCloseReset: () => {
      resetStatus();
    },
  });

  const handleToggleArchive = () => {
    toggleArchiveList(
      { slug },
      {
        onError: (error) => {
          setApiError(
            isArchived ? "Couldn't unarchive list" : "Couldn't archive list",
            error,
          );
        },
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <FileArchiveIcon />
          {isArchived ? "Unarchive" : "Archive"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            {isArchived ? "Unarchive List" : "Archive List"}
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <span>
              {isArchived
                ? "Are you sure you want to unarchive this list?"
                : "Are you sure you want to archive this list?"}
            </span>
            <span>
              {isArchived
                ? "This will make it public again."
                : "This will remove it from public discovery."}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <SubmissionAlert status={status} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isTogglingArchive}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isTogglingArchive}
            onClick={(event) => {
              event.preventDefault();
              handleToggleArchive();
            }}
            variant="destructive"
          >
            {isTogglingArchive ? (
              <>
                <Spinner /> {isArchived ? "Unarchiving..." : "Archiving..."}
              </>
            ) : (
              // eslint-disable-next-line sonarjs/no-nested-conditional
              `${isArchived ? "Unarchive" : "Archive"} List`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
