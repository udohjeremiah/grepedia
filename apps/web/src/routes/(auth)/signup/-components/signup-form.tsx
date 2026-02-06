import { env } from "@/env";
import { signUp } from "@/services/auth/sign-up";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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
  MailIcon,
  OctagonAlertIcon,
  UserRoundIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Please provide at least 2 characters."),
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Please provide at least 8 characters."),
});

type SubmissionStatus = {
  status: "success" | "error";
  title: string;
  description: string;
};

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(null);

      void signUp(
        { ...value, callbackURL: `${env.VITE_BASE_URL}/signin` },
        {
          onSuccess: () => {
            form.reset();
            setSubmissionStatus({
              status: "success",
              title: "Account created successfully",
              description:
                "Check your email to verify your account before signing in.",
            });
          },
          onError: (context) => {
            setSubmissionStatus({
              status: "error",
              title: "Unable to create your account",
              description:
                context.error.message ??
                "Please check your details and try again.",
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
        <h1 className="text-2xl font-medium">Welcome to Grepedia</h1>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button asChild variant="link" className="size-fit gap-1 p-0">
            <Link to="/signin">Sign in</Link>
          </Button>
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                      type="email"
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="outline"
                        size="icon-xs"
                        onClick={() => setShowPassword((prev) => !prev)}
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
          <Field>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? (
                <>
                  <Spinner /> Creating account...
                </>
              ) : (
                "Create Account"
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
        </FieldGroup>
      </form>
    </div>
  );
}
