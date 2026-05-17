import { ToolComments } from "./tool-comments";
import { ToolDescription } from "./tool-description";

export function Tool() {
  return (
    <div className="flex flex-col gap-6">
      <ToolDescription />
      <ToolComments />
    </div>
  );
}
