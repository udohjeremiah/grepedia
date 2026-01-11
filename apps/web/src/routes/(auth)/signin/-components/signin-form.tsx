import { cn } from "@workspace/ui/lib/utils";
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
import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { signIn } from "@/services/auth/sign-in";
import { Session } from "@/lib/auth-client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Spinner } from "@workspace/ui/components/spinner";

const formSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Please provide at least 8 characters."),
  rememberMe: z.boolean(),
});

type SubmissionStatus = {
  type: "error" | "success";
  title: string;
  message: string;
};

export default function SigninForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmissionStatus(null);

      const { data, error } = await signIn(value);

      if (error) {
        setSubmissionStatus({
          type: "error",
          title: "Unable to sign in",
          message: error.message ?? "Please check your details and try again.",
        });
        return;
      }

      form.reset();

      const username = (data as unknown as Session).user.username;
      navigate({ to: `/@${username}` });
    },
  });

  return (
    <div className={cn("flex flex-col gap-12", className)} {...props}>
      <img src="/favicon.svg" width={48} height={48} className="size-8" />
      <div>
        <h1 className="text-2xl font-medium">Sign in to Grepedia</h1>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="size-fit gap-1 p-0">
            <Link to="/signup">Sign up</Link>
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
                  <div className="flex justify-between gap-4">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Button asChild variant="link" className="p-0">
                      <Link to="/request-password-reset">Forgot Password?</Link>
                    </Button>
                  </div>
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
          <form.Field name="rememberMe">
            {(field) => (
              <Field
                orientation="horizontal"
                className="rounded-xl border p-3 has-aria-checked:border-primary/50 has-aria-checked:bg-primary/10"
              >
                <Checkbox
                  id="rememberMe"
                  checked={field.state.value}
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
            <Button type="submit" disabled={form.state.isSubmitting}>
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
