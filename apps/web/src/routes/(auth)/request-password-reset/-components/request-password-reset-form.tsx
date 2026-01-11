import { cn } from "@workspace/ui/lib/utils";
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
import { useState, type ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircleIcon, CircleCheckIcon, MailIcon } from "lucide-react";
import { z } from "zod";

import { useForm } from "@tanstack/react-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Spinner } from "@workspace/ui/components/spinner";
import { requestPasswordReset } from "@/services/auth/request-password-reset";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
});

type SubmissionStatus = {
  type: "error" | "success";
  title: string;
  message: string;
};

export default function RequestPasswordResetForm({
  className,
  ...props
}: ComponentProps<"div">) {
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

      const { error } = await requestPasswordReset(value);

      if (error) {
        setSubmissionStatus({
          type: "error",
          title: "Unable to send reset email",
          message:
            error.message ??
            "Something went wrong while sending the reset email. Please try again.",
        });
        return;
      }

      form.reset();
      setSubmissionStatus({
        type: "success",
        title: "Check your email",
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    },
  });

  return (
    <div className={cn("flex flex-col gap-12", className)} {...props}>
      <img src="/favicon.svg" width={48} height={48} className="size-8" />
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
                  submissionStatus.type === "success"
                    ? "default"
                    : "destructive"
                }
              >
                {submissionStatus.type === "success" ? (
                  <CircleCheckIcon />
                ) : (
                  <AlertCircleIcon />
                )}
                <AlertTitle>{submissionStatus.title}</AlertTitle>
                <AlertDescription>
                  <p>{submissionStatus.message}</p>
                </AlertDescription>
              </Alert>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
