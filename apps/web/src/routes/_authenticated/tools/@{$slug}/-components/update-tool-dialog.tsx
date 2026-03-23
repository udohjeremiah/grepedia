import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import {
  type UpdateToolBody,
  updateToolBodySchema,
} from "@workspace/shared/schemas/tools/update-tool";
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
  InputGroupTextarea,
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
  NotebookPenIcon,
  PlusIcon,
  TagIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { MarkdownEditor } from "@/components/markdown";
import SubmissionAlert from "@/components/submission-alert";
import { env } from "@/env";
import { auth } from "@/hooks/auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useSubmission } from "@/hooks/use-submission";
import { parseExternalUrl } from "@/utils/parse-external-url";

import { useTool } from "../-queries/tool";
import { useToolProposals } from "../revisions/-queries/tool-proposals";
import { useToolUpdate } from "../revisions/-queries/tool-update";

const MAX_LONG_DESCRIPTION = 5000;
const MAX_SUMMARY = 1000;

export default function UpdateToolDialog() {
  const { slug } = useParams({ from: "/_authenticated/tools/@{$slug}" });

  const [externalUrlInput, setExternalUrlInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { user } = auth.useSession();
  const { data: tool } = useTool({ slug });
  const { data: proposals } = useToolProposals({ slug });
  const { mutateAsync: updateTool } = useToolUpdate(slug);
  const { resetStatus, setError, setSuccess, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      changes: {
        categories: tool.categories,
        externalUrls: tool.externalUrls,
        image: tool.image,
        longDescription: tool.longDescription,
        name: tool.name,
        officialUrl: tool.officialUrl,
        releasedAt: tool.releasedAt,
        shortDescription: tool.shortDescription,
        tags: tool.tags,
      },
      discussionUrl: "",
      summary: "",
      title: "",
    } as UpdateToolBody,
    onSubmit: async ({ value }) => {
      resetStatus();

      try {
        await updateTool(value);

        form.reset({
          changes: {
            categories: [],
            externalUrls: undefined,
            image: undefined,
            longDescription: "",
            name: "",
            officialUrl: "",
            releasedAt: undefined,
            shortDescription: "",
            tags: [],
          },
          discussionUrl: "",
          summary: "",
          title: "",
        });

        setExternalUrlInput("");
        setCategoryInput("");
        setTagInput("");

        setSuccess("Update submitted", "Your update is pending review.");
      } catch (error) {
        setError(
          "Couldn't update tool",
          (error as Error).message ??
            "An error occurred while updating this tool. Please try again.",
        );
      }
    },
    validators: {
      onSubmit: updateToolBodySchema,
    },
  });

  const { handleOpenChange, isOpen } = useDialogState({
    onCloseReset: () => {
      form.reset();
      resetStatus();
    },
  });

  const activeUpdate = proposals?.updateCase;
  const canUpdateTool =
    user?.role !== "member" && user?.status === "active" && !activeUpdate;

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-1.5 px-2"
          disabled={!canUpdateTool}
          size="sm"
          variant="outline"
        >
          <NotebookPenIcon className="size-3.5" />
          <span className="text-xs">Update</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-svh max-w-full rounded-none sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Propose Tool Update</DialogTitle>
          <DialogDescription>
            Open a Discord update thread first, then paste the link and your
            proposed changes below.{" "}
            <a
              href={env.VITE_DISCORD_TOOL_UPDATE_URL}
              rel="noreferrer"
              target="_blank"
            >
              Go to the tool update channel
            </a>
            .
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
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Edit Title</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Brief title describing the proposed change"
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
            <form.Field name="discussionUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Discussion URL</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        id={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="https://discord.com/channels/..."
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
            <form.Field name="changes.name">
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
            <form.Field name="changes.officialUrl">
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
            <form.Field name="changes.shortDescription">
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
            <form.Field name="changes.longDescription">
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
            <form.Field mode="array" name="changes.externalUrls">
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
            <form.Field mode="array" name="changes.categories">
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
            <form.Field name="changes.tags">
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
            <form.Field name="changes.image">
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
            <form.Field name="changes.releasedAt">
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
            <form.Field name="summary">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const currentLength = field.state.value.length;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Edit Summary</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        aria-invalid={isInvalid}
                        className="max-h-52"
                        id={field.name}
                        maxLength={MAX_SUMMARY}
                        minLength={20}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Describe the changes you made and why they improve the tool listing."
                        required={true}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="block-end">
                        {currentLength}/{MAX_SUMMARY}
                      </InputGroupAddon>
                    </InputGroup>
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
                      <Spinner /> Submitting...
                    </>
                  ) : (
                    "Submit Update"
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
