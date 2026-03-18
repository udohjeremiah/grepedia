import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { submitToolClaimBodySchema } from "@workspace/shared/schemas/tools/submit-tool-claim";
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
  InputGroupTextarea,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import { BaggageClaimIcon } from "lucide-react";

import SubmissionAlert from "@/components/submission-alert";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useSubmission } from "@/hooks/use-submission";

import { useToolProposals } from "../revisions/-queries/tool-proposals";
import { useToolSubmitClaim } from "../revisions/-queries/tool-submit-claim";

const MAX_CLAIM_REASON = 2000;

export default function ClaimToolDialog() {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });

  const { user } = auth.useSession();
  const { data: proposals } = useToolProposals({ slug });
  const { mutateAsync: requestClaim } = useToolSubmitClaim(slug);
  const { resetStatus, setError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      discussionUrl: "",
      reason: "",
    },
    onSubmit: async ({ value }) => {
      resetStatus();

      try {
        await requestClaim(value);

        form.reset();
        setSuccess("Claim submitted", "Your claim is now in review.");
      } catch (error) {
        setError(
          "Couldn't submit claim",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).message ??
            "An error occurred while submitting this claim. Please try again.",
        );
      }
    },
    validators: {
      onSubmit: submitToolClaimBodySchema,
    },
  });

  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      form.reset();
      resetStatus();
    },
  });

  const activeClaim = proposals?.claimCase;
  const canRequestClaim = user?.status === "active" && !activeClaim;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-1.5 px-2"
          disabled={!canRequestClaim}
          size="sm"
          variant="outline"
        >
          <BaggageClaimIcon className="size-3.5" />
          <span className="text-xs">Claim</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Tool Claim</DialogTitle>
          <DialogDescription>
            Open a Discord claim thread first, then paste the link and your
            claim details below.{" "}
            <a
              href={env.VITE_DISCORD_TOOL_CLAIM_URL}
              rel="noreferrer"
              target="_blank"
            >
              Go to the tool claim channel
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="discussionUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Discussion URL</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="https://discord.com/channels/..."
                        required={true}
                        type="url"
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
            <form.Field name="reason">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const currentLength = field.state.value.length;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Claim Reason</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        aria-invalid={isInvalid}
                        className="max-h-52"
                        id={field.name}
                        maxLength={MAX_CLAIM_REASON}
                        minLength={8}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Explain why you should own this tool."
                        required={true}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="block-end">
                        {currentLength}/{MAX_CLAIM_REASON}
                      </InputGroupAddon>
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
                      <Spinner /> Submitting...
                    </>
                  ) : (
                    "Submit Claim"
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
