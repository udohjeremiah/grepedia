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
import { cn } from "@workspace/ui/lib/utils";
import { SearchIcon, XIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";

export default function Search() {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SearchForm className="max-md:hidden" />
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild className="md:hidden">
          <Button size="icon-sm">
            <SearchIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-md p-4">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Type a term to search. Press Enter or click the search icon to
              submit.
            </DialogDescription>
          </DialogHeader>
          <SearchForm onSubmitted={() => setDialogOpen(false)} />
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
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      navigate({
        to: "/search",
        search: { query: value.query, tab },
      });
      if (value.query !== searchParams.query) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      onSubmitted?.();
    },
  });

  return (
    <search className={cn("w-full max-w-3xl", className)} {...props}>
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
              const canClear = field.state.value.length > 0;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="h-full rounded-xl border-none bg-muted">
                    <InputGroupInput
                      aria-label="Search anything"
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={isInvalid}
                      minLength={2}
                      maxLength={8192}
                      placeholder="Search anything..."
                      name={field.name}
                      value={field.state.value}
                      required
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="md:text-base"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Clear"
                        size="icon-sm"
                        disabled={!canClear}
                        onClick={() => form.reset({ query: "" })}
                        className="rounded-full"
                      >
                        <XIcon />
                      </InputGroupButton>
                      <InputGroupButton
                        aria-label="Search"
                        type="submit"
                        size="icon-sm"
                        disabled={!canSend}
                        className="ms-auto rounded-full"
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
