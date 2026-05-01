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
import { z } from "zod";

import SubmissionAlert from "@/components/submission-alert";
import { env } from "@/env";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";
import { changeEmail } from "@/services/auth/change-email";

const formSchema = z.object({
  newEmail: z.email("Please provide a valid email address."),
});

export default function ChangeEmailDialog() {
  const { resetStatus, setApiError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      newEmail: "",
    },
    onSubmit: async ({ value }) => {
      resetStatus();

      await changeEmail(
        { ...value, callbackURL: `${env.VITE_BASE_URL}/signin` },
        {
          onError: (context) => {
            setApiError("Couldn't update email", context.error);
          },
          onSuccess: () => {
            form.reset();
            setSuccess(
              "Check your email",
              "A confirmation link has been sent to your current email address.",
            );
          },
        },
      );
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      form.reset();
      resetStatus();
    },
  });

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
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
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner /> Updating email...
                    </>
                  ) : (
                    "Update Email"
                  )}
                </Button>
              )}
            </form.Subscribe>
            <SubmissionAlert status={status} />
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
