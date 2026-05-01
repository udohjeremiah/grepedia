import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import type { Session } from "@/lib/auth-client";

import { AppLink } from "@/components/app-link";
import { SubmissionAlert } from "@/components/submission-alert";
import { useSubmission } from "@/hooks/use-submission";
import { signIn } from "@/services/auth/sign-in";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Please provide at least 8 characters.")
    .max(128, "Please provide no more than 128 characters."),
  rememberMe: z.boolean(),
});

export function SignInForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const { resetStatus, setApiError, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      resetStatus();

      await signIn(
        { ...value },
        {
          onError: (context) => {
            setApiError("Unable to sign in", context.error);
          },
          onSuccess: (context) => {
            form.reset();
            const username = (context.data as Session).user.username;
            navigate({
              params: { username },
              reloadDocument: true,
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
        <h1 className="text-2xl font-medium">Sign in to Grepedia</h1>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account? <AppLink to="/signup">Sign up</AppLink>
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
                  <div className="flex justify-between gap-4">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <AppLink to="/request-password-reset">
                      Forgot Password?
                    </AppLink>
                  </div>
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
          <form.Field name="rememberMe">
            {(field) => (
              <Field
                className="border p-3 has-aria-checked:border-primary/50 has-aria-checked:bg-primary/10"
                orientation="horizontal"
              >
                <Checkbox
                  checked={field.state.value}
                  id="remember-me"
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                />
                <FieldContent>
                  <FieldLabel htmlFor="remember-me">Remember Me</FieldLabel>
                  <FieldDescription>
                    Save your login so you stay signed in after closing your
                    browser.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Spinner /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            )}
          </form.Subscribe>
          <SubmissionAlert status={status} />
          <FieldDescription>
            By signing in, you agree to the{" "}
            <AppLink to="/terms-of-service">Terms of Service</AppLink> and{" "}
            <AppLink to="/privacy-policy">Privacy Policy</AppLink>.
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
