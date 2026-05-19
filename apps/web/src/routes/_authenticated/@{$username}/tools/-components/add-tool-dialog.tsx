import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/cn";
import { PlusIcon } from "lucide-react";
import { Activity, useState } from "react";

import { useDialog } from "@/hooks/use-dialog";
import { globalBannerStore } from "@/lib/global-banner-store";
import { getErrorMessage } from "@/utils/get-error-message";

import { useAddTool } from "../-queries/user-add-tool";
import { useGenerateTool } from "../-queries/user-generate-tool";
import { GenerateForm, useGenerateForm } from "./generate-form";
import { ReviewForm, useReviewForm } from "./review-form";

const STEPS = [
  {
    description:
      "Start with the product website. You can review and edit every generated field before submitting.",
    id: 1,
    title: "Generate from URL",
  },
  {
    description:
      "Review the draft, make any corrections, then submit it to the directory.",
    id: 2,
    title: "Review and submit",
  },
];

const GENERATE_FORM_ID = "generate-tool-form";
const REVIEW_FORM_ID = "review-tool-form";

export function AddToolDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const { isPending: isGeneratingTool, mutate: generateTool } =
    useGenerateTool();
  const { isPending: isAddingTool, mutate: addTool } = useAddTool(userId);

  const generateForm = useGenerateForm({
    onSubmit: async (value) => {
      generateTool(value, {
        onError: (error) => {
          globalBannerStore.add({
            description: getErrorMessage(error),
            title: "Generation failed",
            variant: "destructive",
          });
        },
        onSuccess: ({ data }) => {
          reviewForm.setFieldValue("categories", data.categories ?? []);
          reviewForm.setFieldValue("externalUrls", data.externalUrls);
          reviewForm.setFieldValue(
            "longDescription",
            data.longDescription ?? "",
          );
          reviewForm.setFieldValue("name", data.name ?? "");
          reviewForm.setFieldValue("officialUrl", data.officialUrl ?? "");
          reviewForm.setFieldValue("releasedAt", data.releasedAt);
          reviewForm.setFieldValue(
            "shortDescription",
            data.shortDescription ?? "",
          );
          reviewForm.setFieldValue("tags", data.tags ?? []);

          setStep((step) => step + 1);
        },
      });
    },
  });

  const reviewForm = useReviewForm({
    onSubmit: async (value) => {
      addTool(value, {
        onError: (error) => {
          globalBannerStore.add({
            description: getErrorMessage(error),
            title: "Submission failed",
            variant: "destructive",
          });
        },
        onSuccess: ({ data }) => {
          navigate({ params: { slug: data.toolSlug }, to: "/tools/@{$slug}" });
        },
      });
    },
  });

  const { handleOpenChange, isOpen } = useDialog({
    onCloseReset: () => {
      generateForm.reset();
      reviewForm.reset();
      setStep(1);
    },
  });

  const activeFormId = step === 1 ? GENERATE_FORM_ID : REVIEW_FORM_ID;
  const isSubmitting = isGeneratingTool || isAddingTool;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-svh max-w-full flex-col sm:max-w-full">
        <DialogHeader>
          <DialogTitle>{STEPS[step - 1]?.title}</DialogTitle>
          <DialogDescription>{STEPS[step - 1]?.description}</DialogDescription>
          <div className="flex items-center gap-2">
            {STEPS.map((item, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;

              return (
                <button
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "h-1 flex-1 transition-colors",
                    isActive ? "bg-foreground" : "bg-muted",
                  )}
                  disabled={isSubmitting || stepNumber > step}
                  key={item.id}
                  onClick={() => setStep(stepNumber)}
                  type="button"
                />
              );
            })}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <Activity mode={step === 1 ? "visible" : "hidden"}>
            <GenerateForm form={generateForm} formId={GENERATE_FORM_ID} />
          </Activity>
          <Activity mode={step === 2 ? "visible" : "hidden"}>
            <ReviewForm form={reviewForm} formId={REVIEW_FORM_ID} />
          </Activity>
        </div>
        <DialogFooter>
          <Button
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((previous) => previous - 1)}
            variant="outline"
          >
            Back
          </Button>
          <Button disabled={isSubmitting} form={activeFormId} type="submit">
            {isSubmitting ? (
              <Spinner />
            ) : // eslint-disable-next-line sonarjs/no-nested-conditional
            step === STEPS.length ? (
              "Submit"
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
