import { env } from "@/env";
import { requestPasswordReset } from "@/services/auth/request-password-reset";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import { CircleCheckIcon, MailIcon, OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
});

type SubmissionStatus = {
  status: "success" | "error";
  title: string;
  description: string;
};

export default function RequestPasswordResetForm() {
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(null);

      void requestPasswordReset(
        { ...value, redirectTo: `${env.VITE_BASE_URL}/reset-password` },
        {
          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              status: "success",
              title: "Check your email",
              description:
                "If an account exists for this email, a password reset link has been sent.",
            });
          },
          onError: (context) => {
            setSubmissionStatus({
              status: "error",
              title: "Unable to send reset email",
              description:
                context.error.message ??
                "Something went wrong while sending the reset email. Please try again.",
            });
          },
        },
      );
    },
  });

  return (
    <div className="flex flex-col gap-12">
      <img
        src="/favicon.svg"
        alt="Grepedia"
        width={48}
        height={48}
        className="size-8"
      />
      <div>
        <h1 className="text-2xl font-medium">Request password reset</h1>
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Button
            asChild
            variant="link"
            className="size-fit gap-1 self-end p-0"
          >
            <Link to="/signin">Sign in</Link>
          </Button>
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <MailIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      id={field.name}
                      type="email"
                      name={field.name}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <Field>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                "Send Password Reset Link"
              )}
            </Button>
            {submissionStatus && (
              <Alert
                variant={
                  submissionStatus.status === "success" ? "success" : "critical"
                }
              >
                {submissionStatus.status === "success" ? (
                  <CircleCheckIcon />
                ) : (
                  <OctagonAlertIcon />
                )}
                <AlertTitle>{submissionStatus.title}</AlertTitle>
                <AlertDescription>
                  <p>{submissionStatus.status}</p>
                </AlertDescription>
              </Alert>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
