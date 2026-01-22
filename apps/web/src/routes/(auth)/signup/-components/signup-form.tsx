import { cn } from "@workspace/ui/lib/utils";
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
import { useState, type ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserRoundIcon,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { signUp } from "@/services/auth/sign-up";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Spinner } from "@workspace/ui/components/spinner";
import { env } from "@/env";

const formSchema = z.object({
  name: z.string().min(2, "Please provide at least 2 characters."),
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Please provide at least 8 characters."),
});

type SubmissionStatus = {
  type: "success" | "error";
  title: string;
  message: string;
};

export default function SignupForm({
  className,
  ...props
}: ComponentProps<"div">) {
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
              type: "success",
              title: "Account created successfully",
              message:
                "Check your email to verify your account before signing in.",
            });
          },
          onError: (context) => {
            setSubmissionStatus({
              type: "error",
              title: "Unable to create your account",
              message:
                context.error.message ??
                "Please check your details and try again.",
            });
          },
        },
      );
    },
  });

  return (
    <div className={cn("flex flex-col gap-12", className)} {...props}>
      <img src="/favicon.svg" width={48} height={48} className="size-8" />
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
                  submissionStatus.type === "success"
                    ? "default"
                    : "destructive"
                }
              >
                {submissionStatus.type === "success" ? (
                  <CircleCheckIcon />
                ) : (
                  <AlertCircleIcon />
                )}
                <AlertTitle>{submissionStatus.title}</AlertTitle>
                <AlertDescription>
                  <p>{submissionStatus.message}</p>
                </AlertDescription>
              </Alert>
            )}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
