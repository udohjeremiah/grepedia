import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search/search";
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/utils/cn";
import { ArrowUpIcon, SearchIcon } from "lucide-react";
import { type ComponentProps, useRef } from "react";

export default function SearchForm({
  className,
  ...props
}: ComponentProps<"search">) {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      query: "",
    },
    onSubmit: ({ value }) => {
      navigate({
        search: { limit: undefined, query: value.query },
        to: "/search",
      });
    },
    validators: {
      onSubmit: searchQueryStringSchema.pick({ query: true }),
    },
  });

  return (
    <search className={cn(className)} {...props}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
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
                      aria-invalid={isInvalid}
                      aria-label="Ask Grepedia Search"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      maxLength={8192}
                      minLength={2}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Ask Grepedia Search"
                      ref={inputRef}
                      required={true}
                      spellCheck={false}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Send"
                        className="ms-auto rounded-full"
                        disabled={!canSend}
                        size="icon-sm"
                        type="submit"
                        variant="default"
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
