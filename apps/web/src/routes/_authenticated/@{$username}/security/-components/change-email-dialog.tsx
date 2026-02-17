import { useForm } from "@tanstack/react-form";
import { Button } from "@workspace/ui/components/button";
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
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import SubmissionStatusAlert, {
  type SubmissionStatus,
} from "@/components/submission-status-alert";
import { env } from "@/env";
import { changeEmail } from "@/services/auth/change-email";

const formSchema = z.object({
  newEmail: z.email("Please provide a valid email address."),
});

export default function ChangeEmailDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();

  const form = useForm({
    defaultValues: {
      newEmail: "",
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      void changeEmail(
        { ...value, callbackURL: `${env.VITE_BASE_URL}/signin` },
        {
          onError: (context) => {
            setSubmissionStatus({
              description:
                context.error.message ??
                "An error occurred while sending the email change link. Please try again.",
              status: "error",
              title: "Update failed",
            });
          },
          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              description:
                "A confirmation link has been sent to your current email address.",
              status: "info",
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
    <Dialog
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSubmissionStatus(undefined);
        }
      }}
      open={isDialogOpen}
    >
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <MailIcon />
          Change Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Enter the new email address you want to use. We will send a
            confirmation link to your current email address to verify this
            change.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="newEmail">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      New Email Address
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required={true}
                        type="email"
                        value={field.state.value}
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <Field>
              <Button disabled={form.state.isSubmitting} type="submit">
                {form.state.isSubmitting ? (
                  <>
                    <Spinner /> Updating email...
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
              <SubmissionStatusAlert submissionStatus={submissionStatus} />
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
