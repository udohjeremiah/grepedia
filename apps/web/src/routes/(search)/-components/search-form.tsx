import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search";
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowUpIcon, SearchIcon } from "lucide-react";
import { type ComponentProps, useRef } from "react";

const formSchema = searchQueryStringSchema.pick({ query: true });

export default function SearchForm({
  className,
  ...props
}: ComponentProps<"search">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      query: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      navigate({
        to: "/search",
        search: { query: value.query, limit: undefined },
      });
    },
  });

  return (
    <search className={cn(className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="query">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const canSend =
                field.state.meta.isValid && field.state.value.length >= 2;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="h-full rounded-3xl">
                    <InputGroupAddon>
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      ref={inputRef}
                      aria-label="Ask Grepedia Search"
                      autoFocus={true}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={isInvalid}
                      minLength={2}
                      maxLength={8192}
                      placeholder="Ask Grepedia Search"
                      name={field.name}
                      value={field.state.value}
                      required={true}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Send"
                        type="submit"
                        variant="default"
                        size="icon-sm"
                        disabled={!canSend}
                        className="ms-auto rounded-full"
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
