import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Spinner } from "@workspace/ui/components/spinner";
import { PencilIcon, UserRoundIcon } from "lucide-react";
import { z } from "zod";

import AppLink from "@/components/app-link";
import SubmissionAlert from "@/components/submission-alert";
import { countryOptions } from "@/constants/country-options";
import { auth } from "@/hooks/auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useSubmission } from "@/hooks/use-submission";

const formSchema = z.object({
  bio: z.union([
    z
      .string()
      .min(8, "Please provide at least 8 characters.")
      .max(160, "Please provide no more than 160 characters."),
    z.undefined(),
  ]),
  country: z.union([z.string().length(2), z.undefined()]),
  gender: z.union([
    z.enum(["male", "female", "nonBinary", "other", "preferNotToSay"]),
    z.undefined(),
  ]),
  name: z.string().min(2, "Please provide at least 2 characters."),
  username: z
    .string()
    .min(3, "Please provide at least 3 characters.")
    .max(30, "Please provide no more than 30 characters."),
});

type Gender = z.infer<typeof formSchema>["gender"];

export default function EditUserDialog() {
  const navigate = useNavigate();

  const { user } = auth.useSession();
  const { mutateAsync: updateUser } = auth.useUpdateUser();
  const { resetStatus, setError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      bio: user?.bio ?? undefined,
      country: user?.country ?? undefined,
      gender: user?.gender ?? undefined,
      name: user?.name ?? "",
      username: user?.displayUsername ?? "",
    },
    onSubmit: async ({ value }) => {
      resetStatus();

      try {
        await updateUser(value);

        form.reset();
        setSuccess(
          "Account updated",
          "Your account has been updated successfully.",
        );

        navigate({
          params: { username: value.username },
          to: "/@{$username}",
        });
      } catch (error) {
        setError(
          "Couldn't update account",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).message ??
            "An error occurred while updating your account. Please try again.",
        );
      }
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      form.reset();
      resetStatus();
    },
  });

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <PencilIcon />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="h-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Account</DialogTitle>
          <DialogDescription>
            Update your profile here. To change your email address or password,
            visit your{" "}
            <AppLink
              params={{ username: user?.username ?? "" }}
              to="/@{$username}/security"
            >
              security
            </AppLink>{" "}
            settings.
          </DialogDescription>
        </DialogHeader>
        <form
          className="overflow-y-auto px-1"
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
            <form.Field name="gender">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="gap-1" htmlFor={field.name}>
                      Gender
                      <span className="text-sm text-muted-foreground italic">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        field.handleChange(value as Gender);
                        field.handleBlur();
                      }}
                      value={field.state.value}
                    >
                      <SelectTrigger aria-invalid={isInvalid} id={field.name}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="nonBinary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="preferNotToSay">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="country">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedCountry = countryOptions.find(
                  (country) => country.value === field.state.value,
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="gap-1" htmlFor={field.name}>
                      Country
                      <span className="text-sm text-muted-foreground italic">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Combobox
                      autoHighlight={true}
                      items={countryOptions}
                      onValueChange={(value) =>
                        field.handleChange(value ? value.value : undefined)
                      }
                      value={selectedCountry}
                    >
                      <ComboboxInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        placeholder="Search country..."
                        showClear={field.state.value !== undefined}
                      />
                      <ComboboxContent className="pointer-events-auto">
                        <ComboboxEmpty>No countries found.</ComboboxEmpty>
                        <ComboboxList>
                          {(country) => (
                            <ComboboxItem key={country.value} value={country}>
                              {country.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
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
                      Bio
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
                          const value = event.target.value.trim();
                          field.handleChange(value || undefined);
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
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner /> Updating account...
                    </>
                  ) : (
                    "Update Account"
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
