import type { ComponentProps } from "react";

import { Textarea } from "@workspace/ui/components/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { cn } from "@workspace/ui/lib/cn";
import * as DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { useDeferredValue, useMemo, useState } from "react";

type EditorMode = "edit" | "preview";

interface MarkdownPreviewProps {
  className?: string;
  value: string;
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    const href = node.getAttribute("href") || "";

    const isExternal = href && !href.startsWith("/") && !href.startsWith("#");

    if (isExternal) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noreferrer");
    }
  }
});

export function MarkdownEditor({
  className,
  value,
  ...props
}: ComponentProps<"textarea">) {
  const [mode, setMode] = useState<EditorMode>("edit");

  const stringValue = (value ?? "") as string;

  return (
    <div className="border">
      <div className="border-b">
        <ToggleGroup
          onValueChange={(value) => {
            if (!value) return;
            setMode(value as EditorMode);
          }}
          type="single"
          value={mode}
          variant="outline"
        >
          <ToggleGroupItem className="border-none" value="edit">
            Edit
          </ToggleGroupItem>
          <ToggleGroupItem className="border-none" value="preview">
            Preview
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {mode === "edit" && (
        <div className="relative">
          <Textarea
            {...props}
            className={cn("h-75 border-none p-3 text-sm", className)}
            value={value}
          />
          {props.maxLength && (
            <span className="pointer-events-none absolute right-4 bottom-2 text-xs text-muted-foreground">
              {`${stringValue.length}/${props.maxLength}`}
            </span>
          )}
        </div>
      )}
      {mode === "preview" && (
        <MarkdownPreview className="prose-sm h-75 p-3" value={stringValue} />
      )}
    </div>
  );
}

export function MarkdownPreview({ className, value }: MarkdownPreviewProps) {
  const deferredValue = useDeferredValue(value);

  const html = useMemo(() => {
    const parsed = marked.parse(deferredValue, { async: false });
    return DOMPurify.sanitize(parsed, { ADD_ATTR: ["target"] });
  }, [deferredValue]);

  return (
    <div
      className={cn(
        "prose max-w-none overflow-auto prose-neutral dark:prose-invert prose-a:text-primary prose-a:underline-offset-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
