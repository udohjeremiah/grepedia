import { useCallback, useState } from "react";

import type { SubmissionStatus } from "@/components/submission-alert";

import { getErrorMessage } from "@/utils/get-error-message";

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

  const setApiError = useCallback(
    (title: string, error: unknown, fallback?: string) => {
      setError(title, getErrorMessage(error, fallback));
    },
    [setError],
  );

  const setSuccess = useCallback((title: string, description: string) => {
    setStatus({ description, status: "success", title });
  }, []);

  const setInfo = useCallback((title: string, description: string) => {
    setStatus({ description, status: "info", title });
  }, []);

  return {
    isSubmitting,
    resetStatus,
    setApiError,
    setError,
    setInfo,
    setSubmitting,
    setSuccess,
    status,
  };
}
