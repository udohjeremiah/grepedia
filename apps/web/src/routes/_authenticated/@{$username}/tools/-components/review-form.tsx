import { useForm } from "@tanstack/react-form";
import {
  type AddToolBody,
  addToolBodySchema,
} from "@workspace/shared/schemas/tools/add-tool";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
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
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  FolderOpenIcon,
  GlobeIcon,
  PlusIcon,
  TagIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { MarkdownEditor } from "@/components/markdown";

const MAX_LONG_DESCRIPTION = 10_000;

interface ReviewToolStepProps {
  form: ReturnType<typeof useReviewForm>;
  formId: string;
}

interface UseReviewFormOptions {
  onSubmit: (value: AddToolBody) => Promise<void>;
}

export function ReviewForm({ form, formId }: ReviewToolStepProps) {
  const [externalUrlInput, setExternalUrlInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

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
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Tool Name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <WrenchIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required={true}
                    value={field.state.value}
                  />
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="officialUrl">
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
                    required={true}
                    type="url"
                    value={field.state.value}
                  />
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="shortDescription">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Short Description</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Describe what this tool does in one clear sentence."
                    required={true}
                    value={field.state.value}
                  />
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="longDescription">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Long Description</FieldLabel>
                <MarkdownEditor
                  aria-invalid={isInvalid}
                  id={field.name}
                  maxLength={MAX_LONG_DESCRIPTION}
                  minLength={1200}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value.length > MAX_LONG_DESCRIPTION) return;
                    field.handleChange(value);
                  }}
                  placeholder="Explain what the tool does, its key features, and how people use it."
                  required={true}
                  value={field.state.value}
                />
                <FieldDescription>Markdown is supported.</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field mode="array" name="externalUrls">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isDisabled = (field.state.value ?? []).length >= 4;

            function addExternalUrl() {
              if (!externalUrlInput) return;
              if (field.state.value?.includes(externalUrlInput)) return;
              field.pushValue(externalUrlInput);
              field.handleBlur();
              setExternalUrlInput("");
            }

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="gap-1" htmlFor="external-url-input">
                  External URLs
                  <span className="text-sm text-muted-foreground italic">
                    (optional)
                  </span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <GlobeIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    disabled={isDisabled}
                    id="external-url-input"
                    onChange={(event) =>
                      setExternalUrlInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addExternalUrl();
                    }}
                    placeholder="https://github.com/..."
                    type="url"
                    value={externalUrlInput}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      disabled={isDisabled}
                      onClick={addExternalUrl}
                      variant="outline"
                    >
                      <PlusIcon />
                      Add
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                {(field.state.value ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(field.state.value ?? []).map((item, index) => (
                      <Badge className="max-w-full" key={index}>
                        <button
                          className="truncate"
                          onClick={() => {
                            setExternalUrlInput(item);
                            field.removeValue(index);
                          }}
                          type="button"
                        >
                          {new URL(item).hostname}
                        </button>
                        <button
                          className="shrink-0"
                          onClick={() => {
                            field.removeValue(index);
                            field.handleBlur();
                          }}
                          type="button"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Field>
            );
          }}
        </form.Field>
        <form.Field mode="array" name="categories">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isDisabled = (field.state.value ?? []).length >= 4;

            function addCategory() {
              const normalizedValue = categoryInput
                .trim()
                .replaceAll(/\s+/g, " ");
              if (!normalizedValue) return;
              if (field.state.value.includes(normalizedValue)) return;
              field.pushValue(normalizedValue);
              field.handleBlur();
              setCategoryInput("");
            }

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="category-input">Categories</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <FolderOpenIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    disabled={isDisabled}
                    id="category-input"
                    onChange={(event) => setCategoryInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addCategory();
                    }}
                    placeholder="e.g. AI"
                    value={categoryInput}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      disabled={isDisabled}
                      onClick={addCategory}
                      variant="outline"
                    >
                      <PlusIcon />
                      Add
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {field.state.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.state.value.map((category, index) => (
                      <Badge className="max-w-full" key={index}>
                        <button
                          className="truncate"
                          onClick={() => {
                            setCategoryInput(category);
                            field.removeValue(index);
                          }}
                          type="button"
                        >
                          {category}
                        </button>
                        <button
                          className="shrink-0"
                          onClick={() => {
                            field.removeValue(index);
                            field.handleBlur();
                          }}
                          type="button"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field mode="array" name="tags">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isDisabled = (field.state.value ?? []).length >= 8;

            function addTag() {
              const normalizedValue = tagInput.trim().replaceAll(/\s+/g, " ");
              if (!normalizedValue) return;
              if (field.state.value.includes(normalizedValue)) return;
              field.pushValue(normalizedValue.toLowerCase());
              field.handleBlur();
              setTagInput("");
            }

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="tag-input">Tags</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <TagIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-invalid={isInvalid}
                    disabled={isDisabled}
                    id="tag-input"
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addTag();
                    }}
                    placeholder="e.g. open-source"
                    value={tagInput}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      disabled={isDisabled}
                      onClick={addTag}
                      variant="outline"
                    >
                      <PlusIcon />
                      Add
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                {field.state.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.state.value.map((tag, index) => (
                      <Badge className="max-w-full" key={index}>
                        <button
                          className="truncate"
                          onClick={() => {
                            setTagInput(tag);
                            field.removeValue(index);
                          }}
                          type="button"
                        >
                          {tag}
                        </button>
                        <button
                          className="shrink-0"
                          onClick={() => {
                            field.removeValue(index);
                            field.handleBlur();
                          }}
                          type="button"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="releasedAt">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const selectedDate = field.state.value
              ? new Date(field.state.value)
              : undefined;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="gap-1" htmlFor={field.name}>
                  Released At
                  <span className="text-sm text-muted-foreground italic">
                    (optional)
                  </span>
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="justify-start"
                      id={field.name}
                      type="button"
                      variant="outline"
                    >
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}

                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      captionLayout="dropdown"
                      defaultMonth={selectedDate}
                      disabled={{ after: new Date() }}
                      mode="single"
                      onSelect={(date) => {
                        field.handleChange(date?.toISOString() ?? undefined);
                        field.handleBlur();
                      }}
                      selected={selectedDate}
                    />
                  </PopoverContent>
                </Popover>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
    </form>
  );
}

export function useReviewForm({ onSubmit }: UseReviewFormOptions) {
  return useForm({
    defaultValues: {
      categories: [],
      externalUrls: undefined,
      longDescription: "",
      name: "",
      officialUrl: "",
      releasedAt: undefined,
      shortDescription: "",
      tags: [],
    } as AddToolBody,
    onSubmit: async ({ value }) => onSubmit(value),
    validators: {
      onSubmit: addToolBodySchema,
    },
  });
}
