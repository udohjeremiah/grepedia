import { useForm } from "@tanstack/react-form";
import {
  useNavigate,
  useParams,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";
import {
  type AddToolBody,
  addToolBodySchema,
} from "@workspace/shared/schemas/tools/add-tool";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
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
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Spinner } from "@workspace/ui/components/spinner";
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
import SubmissionAlert from "@/components/submission-alert";
import { useSubmission } from "@/hooks/use-submission";
import { parseExternalUrl } from "@/utils/parse-external-url";

import { useAddTool } from "../-queries/user-add-tool";

const MAX_LONG_DESCRIPTION = 5000;

export default function AddToolDialog() {
  const { userId } = useRouteContext({ from: "/_authenticated" });
  const { username } = useParams({ from: "/_authenticated/@{$username}" });
  const searchParams = useSearch({
    from: "/_authenticated/@{$username}/tools/",
  });
  const navigate = useNavigate();

  const [externalUrlInput, setExternalUrlInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { mutateAsync: addTool } = useAddTool(userId);
  const { resetStatus, setError, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      categories: [],
      externalUrls: undefined,
      image: undefined,
      longDescription: "",
      name: "",
      officialUrl: "",
      releasedAt: undefined,
      shortDescription: "",
      tags: [],
    } as AddToolBody,
    onSubmit: async ({ value }) => {
      resetStatus();

      try {
        const { data } = await addTool(value);

        form.reset();
        setExternalUrlInput("");
        setCategoryInput("");
        setTagInput("");

        navigate({
          params: { slug: data.toolSlug },
          to: "/tools/@{$slug}",
        });
      } catch (error) {
        setError(
          "Submission failed",
          (error as Error).message ??
            "An error occurred while submitting the tool. Please try again.",
        );
      }
    },
    validators: {
      onSubmit: addToolBodySchema,
    },
  });

  return (
    <Dialog
      onOpenChange={(open) => {
        navigate({
          params: { username },
          replace: true,
          search: { modal: open ? "add-tool" : undefined },
          to: "/@{$username}/tools",
        });
        if (!open) {
          resetStatus();
        }
      }}
      open={searchParams.modal === "add-tool"}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="h-svh max-w-full rounded-none sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Submit Tool</DialogTitle>
          <DialogDescription>
            Submit a new tool to the directory.
          </DialogDescription>
        </DialogHeader>
        <form
          className="overflow-y-auto px-1"
          onSubmit={(event) => {
            event.preventDefault();
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="https://example.com"
                        required={true}
                        type="url"
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
            <form.Field name="shortDescription">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Short Description
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Short summary for cards and search results."
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
            <form.Field name="longDescription">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const currentLength = field.state.value.length;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Long Description
                    </FieldLabel>
                    <div className="space-y-2">
                      <MarkdownEditor
                        onBlur={field.handleBlur}
                        onChange={(value = "") => {
                          if (value.length > MAX_LONG_DESCRIPTION) return;
                          field.handleChange(value);
                        }}
                        textareaProps={{
                          "aria-invalid": isInvalid,
                          id: field.name,
                          maxLength: MAX_LONG_DESCRIPTION,
                          minLength: 20,
                          placeholder:
                            "Detailed explanation of what the tool does.",
                          required: true,
                        }}
                        value={field.state.value}
                      />
                      <div className="flex justify-end text-xs text-muted-foreground">
                        {currentLength}/{MAX_LONG_DESCRIPTION}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                  const parsedUrl = parseExternalUrl(externalUrlInput);
                  if (!parsedUrl) return;

                  field.pushValue(parsedUrl);
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    {(field.state.value ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(field.state.value ?? []).map((item, index) => (
                          <Badge key={index}>
                            {item.platform}
                            <button
                              onClick={() => {
                                field.removeValue(index);
                                field.handleBlur();
                              }}
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
                        onChange={(event) =>
                          setCategoryInput(event.target.value)
                        }
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
                          <Badge key={index}>
                            {category}
                            <button
                              onClick={() => {
                                field.removeValue(index);
                                field.handleBlur();
                              }}
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="tags">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const isDisabled = (field.state.value ?? []).length >= 8;

                function addTag() {
                  const normalizedValue = tagInput
                    .trim()
                    .replaceAll(/\s+/g, " ");
                  if (!normalizedValue) return;

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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    {field.state.value.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {field.state.value.map((tag, index) => (
                          <Badge key={index}>
                            {tag}
                            <button
                              onClick={() => {
                                field.removeValue(index);
                                field.handleBlur();
                              }}
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
            <form.Field name="image">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="gap-1" htmlFor={field.name}>
                      Image URL
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
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const value = event.target.value.trim();
                          field.handleChange(value || undefined);
                        }}
                        placeholder="https://example.com/image.png"
                        type="url"
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
                          mode="single"
                          onSelect={(date) => {
                            field.handleChange(
                              date?.toISOString() ?? undefined,
                            );
                            field.handleBlur();
                          }}
                          selected={selectedDate}
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner /> Submitting tool...
                    </>
                  ) : (
                    "Submit Tool"
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
