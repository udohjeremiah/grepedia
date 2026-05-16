import { useForm } from "@tanstack/react-form";
import {
  type GenerateToolBody,
  generateToolBodySchema,
} from "@workspace/shared/schemas/tools/generate-tool";
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
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { GlobeIcon } from "lucide-react";

interface GenerateToolStepProps {
  form: ReturnType<typeof useGenerateForm>;
  formId: string;
}

interface UseGenerateFormOptions {
  onSubmit: (value: GenerateToolBody) => Promise<void>;
}

export function GenerateForm({ form, formId }: GenerateToolStepProps) {
  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="url">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Official URL</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <GlobeIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="https://example.com"
                    type="url"
                    value={field.state.value}
                  />
                </InputGroup>
                <FieldDescription>
                  Grepedia will crawl this page and its linked pages to draft
                  the listing.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
    </form>
  );
}

export function useGenerateForm({ onSubmit }: UseGenerateFormOptions) {
  return useForm({
    defaultValues: { url: "" },
    onSubmit: async ({ value }) => onSubmit(value),
    validators: {
      onSubmit: generateToolBodySchema,
    },
  });
}
