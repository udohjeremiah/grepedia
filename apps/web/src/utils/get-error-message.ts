import type { BetterFetchError } from "better-auth/react";

// eslint-disable-next-line depend/ban-dependencies
import axios from "axios";

const hasMessage = (value: unknown): value is { message: string } => {
  if (typeof value !== "object" || value === null) return false;
  if (!("message" in value)) return false;
  return typeof (value as { message?: unknown }).message === "string";
};

const isBetterFetchError = (error: unknown): error is BetterFetchError => {
  return (
    hasMessage(error) &&
    "status" in (error as object) &&
    typeof (error as { status?: unknown }).status === "number"
  );
};

export const getErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as undefined | { message?: string };
    return data?.message ?? fallback;
  }

  if (isBetterFetchError(error) || error instanceof Error) {
    return error.message || fallback;
  }

  return hasMessage(error) ? error.message : fallback;
};
