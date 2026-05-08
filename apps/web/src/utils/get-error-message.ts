export const getErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
};
