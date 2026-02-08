import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
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
import {
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  OctagonAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import AppLink from "@/components/app-link";
import { Session } from "@/lib/auth-client";
import { signIn } from "@/services/auth/sign-in";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Please provide at least 8 characters."),
  rememberMe: z.boolean(),
});

type SubmissionStatus = {
  description: string;
  status: "error" | "success";
  title: string;
};

export default function SigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(undefined);

      void signIn(
        { ...value },
        {
          onError: (context) => {
            setSubmissionStatus({
              description:
                context.error.message ??
                "Please check your details and try again.",
              status: "error",
              title: "Unable to sign in",
            });
          },
          onSuccess: (context) => {
            form.reset();
            const username = (context.data as Session).user.username;
            navigate({ params: { username }, to: "/@{$username}" });
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
                className="rounded-xl border p-3 has-aria-checked:border-primary/50 has-aria-checked:bg-primary/10"
                orientation="horizontal"
              >
                <Checkbox
                  checked={field.state.value}
                  id="rememberMe"
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                />
                <FieldContent>
                  <FieldLabel htmlFor="rememberMe">Remember Me</FieldLabel>
                  <FieldDescription>
                    Save your login so you stay signed in after closing your
                    browser.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          </form.Field>
          <Field>
            <Button disabled={form.state.isSubmitting} type="submit">
              {form.state.isSubmitting ? (
                <>
                  <Spinner /> Logging in...
                </>
              ) : (
                "Login"
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
                  <p>{submissionStatus.description}</p>
                </AlertDescription>
              </Alert>
            )}
          </Field>
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
