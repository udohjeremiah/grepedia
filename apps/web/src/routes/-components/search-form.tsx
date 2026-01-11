import { z } from "zod";

import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field";
import { ArrowUpIcon, XIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group";
import { ComponentProps, useRef } from "react";

const formSchema = z.object({
  q: z
    .string()
    .min(2, "Please provide at least 2 characters.")
    .max(8192, "Please keep it under 8192 characters."),
});

export default function SearchForm(props: ComponentProps<"search">) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm({
    defaultValues: {
      q: "",
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <search {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="q">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const canSend =
                field.state.meta.isValid && field.state.value.length >= 2;
              const canClear = field.state.value.length > 0;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="rounded-3xl">
                    <InputGroupTextarea
                      ref={textareaRef}
                      aria-label="Ask anything"
                      autoFocus={true}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={isInvalid}
                      minLength={2}
                      maxLength={8192}
                      placeholder="Ask anything..."
                      name={field.name}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="max-h-56 md:text-base"
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupButton
                        aria-label="Dismiss"
                        variant={canClear ? "destructive" : "outline"}
                        size="icon-sm"
                        disabled={!canClear}
                        onClick={() => {
                          form.reset();
                          textareaRef.current?.focus();
                        }}
                        className="rounded-full"
                      >
                        <XIcon />
                      </InputGroupButton>
                      <InputGroupButton
                        aria-label="Send"
                        type="submit"
                        variant="default"
                        size="icon-sm"
                        disabled={!canSend}
                        className="ml-auto rounded-full"
                      >
                        <ArrowUpIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
    </search>
  );
}
