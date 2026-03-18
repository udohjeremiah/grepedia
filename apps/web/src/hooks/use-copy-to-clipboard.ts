import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardOptions {
  resetDelayMs?: number;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const { resetDelayMs = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const resetCopied = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    setCopied(false);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = undefined;
        }, resetDelayMs);

        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        resetCopied();
        return false;
      }
    },
    [resetCopied, resetDelayMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
}
