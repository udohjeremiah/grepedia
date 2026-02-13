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

import AppLink from "@/components/app-link";
import { env } from "@/env";
import { requestPasswordReset } from "@/services/auth/request-password-reset";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
});

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function RequestPasswordResetForm() {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      void requestPasswordReset(
        { ...value, redirectTo: `${env.VITE_BASE_URL}/reset-password` },
        {
          onError: (context) => {
            setSubmissionStatus({
              description:
                context.error.message ??
                "Something went wrong while sending the reset email. Please try again.",
              status: "error",
              title: "Unable to send reset email",
            });
          },
          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              description:
                "If an account exists for this email, a password reset link has been sent.",
              status: "success",
              title: "Check your email",
            });
          },
        },
      );
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <div className="flex flex-col gap-12">
      <Link to="/">
        <img
          alt="Grepedia"
          className="size-8"
          height={48}
          src="/favicon.svg"
          width={48}
        />
      </Link>
      <div>
        <h1 className="text-2xl font-medium">Request password reset</h1>
        <p className="text-sm text-muted-foreground">
          Remember your password? <AppLink to="/signin">Sign in</AppLink>
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
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
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required={true}
                      type="email"
                      value={field.state.value}
                    />
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <Field>
            <Button disabled={form.state.isSubmitting} type="submit">
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
                <AlertDescription>{submissionStatus.status}</AlertDescription>
              </Alert>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
