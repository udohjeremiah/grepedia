import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
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
  InputGroupText,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  CircleCheckIcon,
  OctagonAlertIcon,
  PencilIcon,
  UserRoundIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import AppLink from "@/components/app-link";
import { auth } from "@/hooks/auth";

const formSchema = z.object({
  bio: z.union([
    z
      .string()
      .min(10, "Please provide at least 10 characters.")
      .max(160, "Please provide no more than 160 characters."),
    z.undefined(),
  ]),
  name: z.string().min(2, "Please provide at least 2 characters."),
  username: z
    .string()
    .min(3, "Please provide at least 3 characters.")
    .max(30, "Please provide no more than 30 characters."),
});

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function EditDetailsDialog() {
  const { data: sessionData } = auth.useSession();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();
  const { mutate: updateUser } = auth.useUpdateUser();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      bio: sessionData?.user.bio ?? undefined,
      name: sessionData?.user.name ?? "",
      username: sessionData?.user.displayUsername ?? "",
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      updateUser(
        { ...value },
        {
          onError: (error) => {
            setSubmissionStatus({
              description:
                error.message ??
                "An error occurred while updating your account details. Please try again.",
              status: "error",
              title: "Update failed",
            });
          },

          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              description:
                "Your account details have been updated successfully.",
              status: "success",
              title: "Account updated",
            });
            navigate({
              params: { username: value.username },
              to: "/@{$username}",
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
    <Dialog onOpenChange={setDialogOpen} open={isDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <PencilIcon />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Account</DialogTitle>
          <DialogDescription>
            Update your profile details here. To change your email address or
            password, visit your{" "}
            <AppLink
              params={{ username: sessionData?.user.username ?? "" }}
              to="/@{$username}/security"
            >
              security
            </AppLink>{" "}
            settings.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <UserRoundIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required={true}
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
            <form.Field name="username">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required={true}
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
            <form.Field name="bio">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="gap-1" htmlFor={field.name}>
                      Bio{" "}
                      <span className="text-sm text-muted-foreground italic">
                        (optional)
                      </span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <UserRoundIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          field.handleChange(
                            nextValue === "" ? undefined : nextValue,
                          );
                        }}
                        value={field.state.value ?? ""}
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
                    <Spinner /> Updating account...
                  </>
                ) : (
                  "Update Account"
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
