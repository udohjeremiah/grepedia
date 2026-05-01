import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import {
  ModeratorReviewCaseBody,
  moderatorReviewCaseBodySchema,
} from "@workspace/shared/schemas/moderation/moderator-review-case";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Spinner } from "@workspace/ui/components/spinner";
import { z } from "zod";

import { SubmissionAlert } from "@/components/submission-alert";
import { useDialog } from "@/hooks/use-dialog";
import { useSubmission } from "@/hooks/use-submission";

import { useToolModeratorReviewCase } from "../-queries/tool-moderator-review-case";

type DECISION = z.infer<typeof moderatorReviewCaseBodySchema>["decision"];

type ToolModeratorDialogProps = {
  currentStatus: "open" | "under_review";
  id: string;
};

const MAX_SUMMARY = 1000;

export function ToolModeratorDialog({
  currentStatus,
  id,
}: ToolModeratorDialogProps) {
  const { slug } = useParams({ from: "/tools/@{$slug}" });

  const { isPending: isReviewing, mutate: reviewCase } =
    useToolModeratorReviewCase(slug);
  const { resetStatus, setApiError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      caseId: id,
      decision: currentStatus === "under_review" ? "" : "under_review",
      decisionSummary: undefined,
      decisionTitle: undefined,
    } as ModeratorReviewCaseBody,
    onSubmit: async ({ value }) => {
      resetStatus();

      reviewCase(value, {
        onError: (error) => setApiError("Could not update case", error),
        onSuccess: () => {
          setSuccess(
            "Case updated",
            value.decision === "under_review"
              ? "Case moved to under review."
              : // eslint-disable-next-line sonarjs/no-nested-conditional
                `Case ${value.decision === "approve" ? "approved" : "rejected"}.`,
          );
        },
      });
    },
    validators: {
      onSubmit: moderatorReviewCaseBodySchema,
    },
  });

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      form.reset();
      resetStatus();
    },
  });

  const decisionOptions =
    currentStatus === "under_review"
      ? ["approve", "reject"]
      : ["under_review", "approve", "reject"];

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="xs" variant="outline">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Update Case</DialogTitle>
          <DialogDescription>
            Select a decision and provide details when approving or rejecting.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="decision">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Decision</FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        field.handleChange(value as DECISION);
                        field.handleBlur();

                        if (value === "under_review") {
                          form.setFieldValue("decisionTitle", undefined);
                          form.setFieldValue("decisionSummary", undefined);
                        }
                      }}
                      value={field.state.value}
                    >
                      <SelectTrigger aria-invalid={isInvalid} id={field.name}>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        {decisionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Subscribe selector={(state) => state.values.decision}>
              {(decision) => {
                const showDecisionFields = decision !== "under_review";

                return (
                  showDecisionFields && (
                    <>
                      <form.Field name="decisionTitle">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Decision Title
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupInput
                                  aria-invalid={isInvalid}
                                  id={field.name}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  placeholder="Brief title describing the decision"
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
                      <form.Field name="decisionSummary">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          const currentLength = field.state.value?.length ?? 0;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                Decision Summary
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupTextarea
                                  aria-invalid={isInvalid}
                                  className="max-h-52"
                                  id={field.name}
                                  maxLength={MAX_SUMMARY}
                                  minLength={20}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  placeholder="Explain why you approved or rejected this case, including the reasoning, context, or evidence that influenced your decision."
                                  required={true}
                                  value={field.state.value}
                                />
                                <InputGroupAddon align="block-end">
                                  {currentLength}/{MAX_SUMMARY}
                                </InputGroupAddon>
                              </InputGroup>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </>
                  )
                );
              }}
            </form.Subscribe>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting || isReviewing} type="submit">
                  {isSubmitting || isReviewing ? (
                    <>
                      <Spinner /> Reviewing...
                    </>
                  ) : (
                    "Submit Review"
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
