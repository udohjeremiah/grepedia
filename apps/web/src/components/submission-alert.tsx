import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  type LucideIcon,
  OctagonAlertIcon,
} from "lucide-react";

export type SubmissionStatus = {
  description: string;
  status: "error" | "info" | "success";
  title: string;
};

interface SubmissionAlertProps {
  status?: SubmissionStatus;
}

const statusConfig: Record<
  SubmissionStatus["status"],
  {
    icon: LucideIcon;
    variant: "destructive" | "info" | "success";
  }
> = {
  error: {
    icon: OctagonAlertIcon,
    variant: "destructive",
  },
  info: {
    icon: CircleAlertIcon,
    variant: "info",
  },
  success: {
    icon: CircleCheckIcon,
    variant: "success",
  },
};

export function SubmissionAlert({ status }: SubmissionAlertProps) {
  if (!status) return;

  const { icon: Icon, variant } = statusConfig[status.status];

  return (
    <Alert variant={variant}>
      <Icon />
      <AlertTitle>{status.title}</AlertTitle>
      <AlertDescription>{status.description}</AlertDescription>
    </Alert>
  );
}
