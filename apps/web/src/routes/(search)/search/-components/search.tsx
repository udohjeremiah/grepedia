import { useForm } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { searchQueryStringSchema } from "@workspace/shared/schemas/search";
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
import { cn } from "@workspace/ui/utils/cn";
import { SearchIcon, XIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";

export default function Search() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <SearchForm className="max-md:hidden" />
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
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
          <SearchForm onSubmitted={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const formSchema = searchQueryStringSchema.pick({ query: true });

type SearchFormProps = ComponentProps<"search"> & {
  onSubmitted?: () => void;
};

function SearchForm({ className, onSubmitted, ...props }: SearchFormProps) {
  const searchParams = useSearch({ from: "/(search)/search/" });
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
      onSubmit: formSchema,
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
                  <InputGroup className="h-full rounded-xl border-none bg-muted">
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      aria-label="Search anything"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      className="md:text-base"
                      maxLength={8192}
                      minLength={2}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Search anything..."
                      required
                      spellCheck={false}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Clear"
                        className="rounded-full"
                        disabled={!canClear}
                        onClick={() => form.reset({ query: "" })}
                        size="icon-sm"
                      >
                        <XIcon />
                      </InputGroupButton>
                      <InputGroupButton
                        aria-label="Search"
                        className="ms-auto rounded-full"
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
