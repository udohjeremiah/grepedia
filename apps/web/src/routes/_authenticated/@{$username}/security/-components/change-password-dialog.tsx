import { useForm } from "@tanstack/react-form";
import { omitKeys } from "@workspace/shared/omit-keys";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
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
  KeyRoundIcon,
  LockIcon,
  OctagonAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { changePassword } from "@/services/auth/change-password";

const formSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, "Please provide at least 8 characters.")
      .max(128, "Please provide no more than 128 characters."),
    currentPassword: z
      .string()
      .min(8, "Please provide at least 8 characters.")
      .max(128, "Please provide no more than 128 characters."),
    newPassword: z
      .string()
      .min(8, "Please provide at least 8 characters.")
      .max(128, "Please provide no more than 128 characters."),
    revokeOtherSessions: z.boolean(),
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

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function ChangePasswordDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();

  const form = useForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: false,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      void changePassword(
        { ...omitKeys(value, ["confirmPassword"]) },
        {
          onError: (context) => {
            setSubmissionStatus({
              description:
                context.error.message ??
                "An error occurred while updating your password. Please try again.",
              status: "error",
              title: "Update failed",
            });
          },
          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              description: "Your password have been updated successfully.",
              status: "success",
              title: "Password updated",
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
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <KeyRoundIcon />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password, then choose a new one with at least 8
            characters. Use a password you do not use anywhere else.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="currentPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current Password
                    </FieldLabel>
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
                        type={showCurrentPassword ? "text" : "password"}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          onClick={() =>
                            setShowCurrentPassword((previous) => !previous)
                          }
                          size="icon-xs"
                          variant="outline"
                        >
                          {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="revokeOtherSessions">
              {(field) => (
                <Field
                  className="flex rounded-xl border p-3 has-aria-checked:border-primary/50 has-aria-checked:bg-primary/10"
                  orientation="horizontal"
                >
                  <Checkbox
                    checked={field.state.value}
                    id="revokeOtherSessions"
                    onCheckedChange={(checked) =>
                      field.handleChange(Boolean(checked))
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="revokeOtherSessions">
                      Revoke Other Sessions
                    </FieldLabel>
                    <FieldDescription>
                      Other devices will be signed out within 5 minutes.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            </form.Field>
            <Field>
              <Button disabled={form.state.isSubmitting} type="submit">
                {form.state.isSubmitting ? (
                  <>
                    <Spinner /> Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
              {submissionStatus && (
                <Alert
                  variant={
                    submissionStatus.status === "success"
                      ? "success"
                      : "critical"
                  }
                >
                  {submissionStatus.status === "success" ? (
                    <CircleCheckIcon />
                  ) : (
                    <OctagonAlertIcon />
                  )}
                  <AlertTitle>{submissionStatus.title}</AlertTitle>
                  <AlertDescription>
                    {submissionStatus.description}
                  </AlertDescription>
                </Alert>
              )}
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
