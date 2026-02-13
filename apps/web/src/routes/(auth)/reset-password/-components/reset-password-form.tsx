import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { omitKeys } from "@workspace/shared/omit-keys";
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
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  OctagonAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { resetPassword } from "@/services/auth/reset-password";

const formSchema = z
  .object({
    confirmPassword: z.string().min(8, "Please provide at least 8 characters."),
    newPassword: z.string().min(8, "Please provide at least 8 characters."),
    token: z.string().min(1),
  })
  .superRefine(({ confirmPassword, newPassword }, context) => {
    if (newPassword !== confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

interface ResetPasswordFormProps {
  token: string;
}

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
      token,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      void resetPassword(
        { ...omitKeys(value, ["confirmPassword"]) },
        {
          onError: (context) => {
            setSubmissionStatus({
              description:
                context.error.message ??
                "This reset link may be invalid or expired. Please request a new one and try again.",
              status: "error",
              title: "Unable to reset password",
            });
          },
          onSuccess: () => {
            form.reset();
            navigate({ to: "/signin" });
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
        <h1 className="text-2xl font-medium">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password to keep your account secure.
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon />
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
                      type={showNewPassword ? "text" : "password"}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() =>
                          setShowNewPassword((previous) => !previous)
                        }
                        size="icon-xs"
                        variant="outline"
                      >
                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon />
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        size="icon-xs"
                        variant="outline"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
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
                  <Spinner /> Resetting password...
                </>
              ) : (
                "Reset Password"
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
