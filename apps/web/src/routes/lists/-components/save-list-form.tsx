import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  type SaveListBody,
  saveListBodySchema,
} from "@workspace/shared/schemas/lists/save-list";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useRef, useState } from "react";

import { MarkdownEditor } from "@/components/markdown";
import { SubmissionAlert } from "@/components/submission-alert";
import { useSubmission } from "@/hooks/use-submission";

import { useList } from "../$slug/-queries/list";
import { usePublishList } from "../-queries/user-publish-list";
import { useSaveList } from "../-queries/user-save-list";
import { useSearchTools } from "../-queries/user-search-tools";

type BuilderTool = {
  _id: string;
  name: string;
  officialUrl: string;
  shortDescription: string;
  slug: string;
};

type ListWithTools = ReturnType<typeof useList>["data"];

type SubmitAction = "publish" | "save";

const MAX_DESCRIPTION = 500;

export function SaveListForm({ list }: { list?: ListWithTools }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuilderTool[]>([]);
  const [toolMap, setToolMap] = useState(() => toToolMap(toBuilderTools(list)));
  const submitActionRef = useRef<SubmitAction>("save");

  const { isPending: isSaving, mutate: saveList } = useSaveList();
  const { isPending: isPublishing, mutate: publishList } = usePublishList();
  const { isPending: isSearching, mutate: searchTools } = useSearchTools();

  const { resetStatus, setApiError, status } = useSubmission();

  const form = useForm({
    defaultValues: {
      description: list?.description ?? "",
      slug: list?.slug,
      title: list?.title ?? "",
      tools: (list?.tools ?? []).map((tool, index) => ({
        position: index + 1,
        toolId: tool._id,
      })),
    } as SaveListBody,
    onSubmit: ({ value }) => {
      resetStatus();

      const submitAction = submitActionRef.current;

      saveList(value, {
        onError: (error) => {
          setApiError("Couldn't save list", error);
        },
        onSuccess: ({ data }) => {
          if (submitAction === "publish") {
            publishList(
              { slug: data.listSlug },
              {
                onError: (error) => {
                  setApiError("Couldn't publish list", error);
                },
                onSuccess: ({ data: publishedData }) => {
                  navigate({
                    params: { slug: publishedData.listSlug },
                    to: "/lists/$slug",
                  });
                },
              },
            );
            return;
          }

          navigate({
            params: { slug: data.listSlug },
            to: "/lists/$slug",
          });
        },
      });
    },
    validators: {
      onSubmit: saveListBodySchema,
    },
  });

  const handleSearch = () => {
    const safeQuery = query.trim();
    if (safeQuery.length < 2) return;

    searchTools(
      { query: safeQuery, tab: "all" },
      {
        onSuccess: ({ data }) => {
          setResults(data.tools);
          setToolMap((tools) => ({ ...tools, ...toToolMap(data.tools) }));
        },
      },
    );
  };

  const isSubmitting = isSaving || isPublishing;

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        className="space-y-4"
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
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={isInvalid}
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder={`Best 10 open source developer tools of ${new Date().getFullYear()}`}
                      required={true}
                      value={field.state.value}
                    />
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <MarkdownEditor
                    aria-invalid={isInvalid}
                    id={field.name}
                    maxLength={MAX_DESCRIPTION}
                    minLength={20}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.length > MAX_DESCRIPTION) return;
                      field.handleChange(value);
                    }}
                    placeholder="Explain what this list helps readers discover."
                    required={true}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field mode="array" name="tools">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              const moveTool = (index: number, direction: -1 | 1) => {
                field.moveValue(index, index + direction);
                field.handleBlur();
              };

              const removeTool = (index: number) => {
                field.removeValue(index);
                field.handleBlur();
              };

              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between gap-4">
                    <FieldLabel>Selected tools</FieldLabel>
                    <Badge variant="secondary">
                      {field.state.value.length}/50
                    </Badge>
                  </div>
                  {field.state.value.length > 0 ? (
                    <ol className="flex flex-col gap-2">
                      {field.state.value.map((tool, index) => {
                        const selectedTool = toolMap[tool.toolId];
                        if (!selectedTool) return;

                        return (
                          <li
                            className="flex gap-3 border bg-background p-3 transition duration-200 hover:border-foreground/30"
                            key={selectedTool._id}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center border text-xs font-semibold">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {selectedTool.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {selectedTool.shortDescription}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                disabled={index === 0}
                                onClick={() => moveTool(index, -1)}
                                size="icon-xs"
                                type="button"
                                variant="ghost"
                              >
                                <ArrowUpIcon />
                              </Button>
                              <Button
                                disabled={
                                  index === field.state.value.length - 1
                                }
                                onClick={() => moveTool(index, 1)}
                                size="icon-xs"
                                type="button"
                                variant="ghost"
                              >
                                <ArrowDownIcon />
                              </Button>
                              <Button
                                onClick={() => removeTool(index)}
                                size="icon-xs"
                                type="button"
                                variant="ghost"
                              >
                                <Trash2Icon />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Search for tools and add them to start your list.
                    </div>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        <SubmissionAlert status={status} />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isSubmitting}
            onClick={() => {
              submitActionRef.current = "save";
            }}
            variant="outline"
          >
            {isSaving && <Spinner />} Save Draft
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => {
              submitActionRef.current = "publish";
            }}
          >
            {isPublishing && <Spinner />} Publish
          </Button>
        </div>
      </form>
      <aside className="space-y-3 border bg-background p-4 lg:sticky lg:top-4 lg:h-fit">
        <h3 className="text-sm font-semibold">Add tools</h3>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              handleSearch();
            }}
            placeholder="Search tools..."
            value={query}
          />
        </InputGroup>
        <Button
          className="w-full"
          disabled={query.trim().length < 2 || isSearching}
          onClick={handleSearch}
          type="button"
          variant="outline"
        >
          {isSearching ? <Spinner /> : <SearchIcon />}
          Search
        </Button>
        <div className="space-y-2">
          <form.Field mode="array" name="tools">
            {(field) => {
              const selectedToolIds = new Set(
                field.state.value.map((tool) => tool.toolId),
              );

              const addTool = (tool: BuilderTool) => {
                if (
                  field.state.value.length >= 50 ||
                  selectedToolIds.has(tool._id)
                ) {
                  return;
                }

                setToolMap((tools) => ({ ...tools, [tool._id]: tool }));

                field.pushValue({
                  position: field.state.value.length + 1,
                  toolId: tool._id,
                });
                field.handleBlur();
              };

              return results.map((tool) => {
                const isSelected = selectedToolIds.has(tool._id);

                return (
                  <div
                    className="flex justify-between gap-4 border p-2 transition duration-200 hover:border-foreground/30"
                    key={tool._id}
                  >
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tool.shortDescription}
                      </p>
                    </div>
                    <Button
                      disabled={isSelected}
                      onClick={() => addTool(tool)}
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    >
                      {isSelected ? <CheckIcon /> : <PlusIcon />}
                    </Button>
                  </div>
                );
              });
            }}
          </form.Field>
        </div>
      </aside>
    </div>
  );
}

function toBuilderTools(list?: ListWithTools): BuilderTool[] {
  return (
    list?.tools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      officialUrl: tool.officialUrl,
      shortDescription: tool.shortDescription,
      slug: tool.slug,
    })) ?? []
  );
}

function toToolMap(tools: BuilderTool[]) {
  return Object.fromEntries(tools.map((tool) => [tool._id, tool] as const));
}
