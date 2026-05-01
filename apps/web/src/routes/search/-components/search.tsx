import type { ComponentProps } from "react";

import { useForm } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search/search";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/cn";
import { SearchIcon, XIcon } from "lucide-react";

import { useDialog } from "@/hooks/use-dialog";

interface SearchFormProps extends ComponentProps<"search"> {
  onSubmitted?: () => void;
}

export function Search() {
  const { handleOpenChange, isOpen, setIsOpen } = useDialog();

  return (
    <>
      <SearchForm className="max-md:hidden" />
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogTrigger asChild className="md:hidden">
          <Button size="icon-sm">
            <SearchIcon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Type a term to search. Press Enter or click the search icon to
              submit.
            </DialogDescription>
          </DialogHeader>
          <SearchForm onSubmitted={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchForm({ className, onSubmitted, ...props }: SearchFormProps) {
  const searchParams = useSearch({ from: "/search/" });
  const navigate = useNavigate();

  const tab = searchParams.tab;

  const form = useForm({
    defaultValues: {
      query: searchParams.query,
    },
    onSubmit: ({ value }) => {
      navigate({
        search: { limit: undefined, query: value.query, tab },
        to: "/search",
      });
      if (value.query !== searchParams.query) {
        window.scrollTo({ behavior: "smooth", top: 0 });
      }
      onSubmitted?.();
    },
    validators: {
      onSubmit: searchQueryStringSchema.pick({ query: true }),
    },
  });

  return (
    <search className={cn("w-full max-w-2xl", className)} {...props}>
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
              const canClear = field.state.value.length > 0;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="h-full border-none bg-muted">
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      aria-label="Ask anything, find anything..."
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      className="px-1 md:text-base"
                      maxLength={8192}
                      minLength={2}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Ask anything, find anything..."
                      required={true}
                      spellCheck={false}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Clear"
                        disabled={!canClear}
                        onClick={() => form.reset({ query: "" })}
                        size="icon-sm"
                      >
                        <XIcon />
                      </InputGroupButton>
                      <InputGroupButton
                        aria-label="Search"
                        disabled={!canSend}
                        size="icon-sm"
                        type="submit"
                      >
                        <SearchIcon />
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
