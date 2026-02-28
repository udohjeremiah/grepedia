import { useCallback, useState } from "react";

import type { SubmissionStatus } from "@/components/submission-alert";

export function useSubmission() {
  const [status, setStatus] = useState<SubmissionStatus | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetStatus = useCallback(() => setStatus(undefined), []);

  const setSubmitting = useCallback(
    (value: boolean) => setIsSubmitting(value),
    [],
  );

  const setError = useCallback((title: string, description: string) => {
    setStatus({ description, status: "error", title });
  }, []);

  const setSuccess = useCallback((title: string, description: string) => {
    setStatus({ description, status: "success", title });
  }, []);

  const setInfo = useCallback((title: string, description: string) => {
    setStatus({ description, status: "info", title });
  }, []);

  return {
    isSubmitting,
    resetStatus,
    setError,
    setInfo,
    setSubmitting,
    setSuccess,
    status,
  };
}
