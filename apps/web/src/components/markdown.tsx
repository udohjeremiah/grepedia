import type MDEditor from "@uiw/react-md-editor";
import type { MDEditorProps } from "@uiw/react-md-editor";
import type { ComponentProps } from "react";

import { omitKeys } from "@workspace/shared/omit-keys";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/utils/cn";
import { useEffect, useState } from "react";
import rehypeSanitize from "rehype-sanitize";

type MarkdownPreviewProps = ComponentProps<typeof MDEditor.Markdown>;

export function MarkdownEditor({
  className,
  onBlur,
  onChange,
  preview = "edit",
  previewOptions,
  value,
  visibleDragbar = false,
  ...props
}: MDEditorProps) {
  const [editorModule, setEditorModule] =
    useState<typeof import("@uiw/react-md-editor")>();

  useEffect(() => {
    let isMounted = true;

    import("@uiw/react-md-editor").then((module) => {
      if (isMounted) setEditorModule(module);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fix (hack): scroll lock not released after closing dialog
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, []);

  const MDEditor = editorModule?.default;

  if (!MDEditor) {
    const textareaProps = omitKeys(props.textareaProps ?? {}, [
      "onScroll",
      "renderTextarea",
    ]);

    return (
      <Textarea
        {...textareaProps}
        onBlur={textareaProps.onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      />
    );
  }

  const mergedPreviewOptions = {
    ...previewOptions,
    components: {
      ...previewOptions?.components,
      a: ({ href, ...rest }: ComponentProps<"a">) => {
        const isExternal =
          !!href && !href.startsWith("/") && !href.startsWith("#");

        return (
          <a
            {...rest}
            href={href}
            rel={isExternal ? "noreferrer" : undefined}
            target={isExternal ? "_blank" : undefined}
          />
        );
      },
    },
    rehypePlugins: [...(previewOptions?.rehypePlugins ?? []), rehypeSanitize],
  };

  return (
    <MDEditor
      {...props}
      className={cn("overflow-hidden! rounded-lg! font-sans!", className)}
      onBlur={onBlur}
      onChange={(value) => onChange?.(value)}
      preview={preview}
      previewOptions={mergedPreviewOptions}
      value={value}
      visibleDragbar={visibleDragbar}
    />
  );
}

export function MarkdownPreview({ className, ...props }: MarkdownPreviewProps) {
  const [editorModule, setEditorModule] =
    useState<typeof import("@uiw/react-md-editor")>();

  useEffect(() => {
    let isMounted = true;

    import("@uiw/react-md-editor").then((module) => {
      if (isMounted) setEditorModule(module);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const MDEditor = editorModule?.default;

  if (!MDEditor) {
    return (
      <p className="text-sm whitespace-break-spaces text-muted-foreground">
        {props.source}
      </p>
    );
  }

  const mergedRehypePlugins = [...(props.rehypePlugins ?? []), rehypeSanitize];
  const mergedComponents = {
    ...props.components,
    a: ({ href, ...rest }: ComponentProps<"a">) => {
      const isExternal =
        !!href && !href.startsWith("/") && !href.startsWith("#");

      return (
        <a
          {...rest}
          href={href}
          rel={isExternal ? "noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        />
      );
    },
  };

  return (
    <MDEditor.Markdown
      {...props}
      className={cn("bg-inherit! font-sans! text-sm!", className)}
      components={mergedComponents}
      rehypePlugins={mergedRehypePlugins}
    />
  );
}
