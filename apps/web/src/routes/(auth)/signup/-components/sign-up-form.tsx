import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
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
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserRoundIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import AppLink from "@/components/app-link";
import SubmissionAlert from "@/components/submission-alert";
import { env } from "@/env";
import { useSubmission } from "@/hooks/use-submission";
import { signUp } from "@/services/auth/sign-up";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
  name: z.string().min(2, "Please provide at least 2 characters."),
  password: z
    .string()
    .min(8, "Please provide at least 8 characters.")
    .max(128, "Please provide no more than 128 characters."),
});

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { resetStatus, setError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      resetStatus();

      await signUp(
        { ...value, callbackURL: `${env.VITE_BASE_URL}/signin` },
        {
          onError: (context) => {
            setError(
              "Unable to create your account",
              context.error.message ??
                "Please check your details and try again.",
            );
          },
          onSuccess: () => {
            form.reset();
            setSuccess(
              "Account created",
              "Check your email to verify your account before signing in.",
            );
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
        <h1 className="text-2xl font-medium">Welcome to Grepedia</h1>
        <p className="text-sm text-muted-foreground">
          Already have an account? <AppLink to="/signin">Sign in</AppLink>
        </p>
      </div>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
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
          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      required={true}
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setShowPassword((previous) => !previous)}
                        size="icon-xs"
                        variant="outline"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Spinner /> Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            )}
          </form.Subscribe>
          <SubmissionAlert status={status} />
          <FieldDescription>
            By signing up, you agree to the{" "}
            <AppLink to="/terms-of-service">Terms of Service</AppLink> and{" "}
            <AppLink to="/privacy-policy">Privacy Policy</AppLink>.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
