import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { SendIcon } from "lucide-react";
import { useState } from "react";

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
  const { user } = auth.useSession();
  const [replyText, setReplyText] = useState("");
  const { isPending, mutate: addComment } = useToolAddComment(slug);

  const handleReply = () => {
    const content = replyText.trim();
    if (!content || !user) return;

    addComment(
      {
        content,
        parentCommentId: commentId,
        user: {
          _id: user.id,
          image: user.image ?? undefined,
          name: user.name,
          username: user.username,
        },
      },
      {
        onSuccess: () => {
          setReplyText("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        className="max-h-52 min-h-16 text-sm"
        onChange={(event) => setReplyText(event.target.value)}
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
