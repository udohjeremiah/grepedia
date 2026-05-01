import { Button } from "@workspace/ui/components/button";
import { SendIcon } from "lucide-react";
import { useState } from "react";

import { MarkdownEditor } from "@/components/markdown";
import { auth } from "@/hooks/auth";

import { useToolAddComment } from "../-queries/tool-add-comment";

interface ToolCommentReplyProps {
  commentId: string;
  slug: string;
  username: string;
}

export default function ToolCommentReply({
  commentId,
  slug,
  username,
}: ToolCommentReplyProps) {
  const [replyText, setReplyText] = useState("");
  const { user } = auth.useSession();

  const { isPending, mutate: addComment } = useToolAddComment(slug);

  const handleReply = () => {
    if (!user?.id) return globalThis.location.assign("/signin");

    const content = replyText.trim();
    if (!content) return;

    addComment(
      { content, parentCommentId: commentId },
      {
        onSuccess: () => {
          setReplyText("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <MarkdownEditor
        maxLength={5000}
        minLength={1}
        onChange={(event) => {
          const value = event.target.value;
          if (value.length > 5000) return;
          setReplyText(value);
        }}
        placeholder={`Reply to @${username}...`}
        required={true}
        value={replyText}
      />
      <Button
        disabled={!replyText.trim() || isPending}
        onClick={handleReply}
        size="xs"
      >
        <SendIcon />
      </Button>
    </div>
  );
}
