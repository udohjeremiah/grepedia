import type { ComponentType, SVGProps } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  OctagonAlertIcon,
} from "lucide-react";

export type SubmissionStatus = {
  description: string;
  status: "error" | "info" | "success";
  title: string;
};

type SubmissionStatusAlertProps = {
  submissionStatus?: SubmissionStatus;
};

const statusConfig: Record<
  SubmissionStatus["status"],
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    variant: "critical" | "info" | "success";
  }
> = {
  error: {
    icon: OctagonAlertIcon,
    variant: "critical",
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

export default function SubmissionStatusAlert({
  submissionStatus,
}: SubmissionStatusAlertProps) {
  if (!submissionStatus) return;

  const { icon: Icon, variant } = statusConfig[submissionStatus.status];

  return (
    <Alert variant={variant}>
      <Icon />
      <AlertTitle>{submissionStatus.title}</AlertTitle>
      <AlertDescription>{submissionStatus.description}</AlertDescription>
    </Alert>
  );
}
