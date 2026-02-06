import { resetPassword } from "@/services/auth/reset-password";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
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

const formSchema = z
  .object({
    newPassword: z.string().min(8, "Please provide at least 8 characters."),
    confirmPassword: z.string().min(8, "Please provide at least 8 characters."),
    token: z.string().min(1),
  })
  .superRefine(({ newPassword, confirmPassword }, context) => {
    if (newPassword !== confirmPassword) {
      context.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match.",
      });
    }
  });

type SubmissionStatus = {
  status: "success" | "error";
  title: string;
  description: string;
};

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      token,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(null);

      void resetPassword(
        { ...omitKeys(value, ["confirmPassword"]) },
        {
          onSuccess: () => {
            form.reset();
            navigate({ to: "/signin" });
          },
          onError: (context) => {
            setSubmissionStatus({
              status: "error",
              title: "Unable to reset password",
              description:
                context.error.message ??
                "This reset link may be invalid or expired. Please request a new one and try again.",
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
        <h1 className="text-2xl font-medium">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password to keep your account secure.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
                      type={showNewPassword ? "text" : "password"}
                      name={field.name}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="outline"
                        size="icon-xs"
                        onClick={() => setShowNewPassword((prev) => !prev)}
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
                      type={showConfirmPassword ? "text" : "password"}
                      name={field.name}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="outline"
                        size="icon-xs"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            <Button type="submit" disabled={form.state.isSubmitting}>
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
