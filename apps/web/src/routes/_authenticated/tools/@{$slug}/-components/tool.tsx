import ToolComments from "./tool-comments";
import ToolDescription from "./tool-description";
import ToolHeader from "./tool-header";
import ToolSidebar from "./tool-sidebar";

export default function Tool() {
  return (
    <div className="flex flex-col gap-8">
      <ToolHeader />
      <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[25%_minmax(0,1fr)] lg:grid-rows-none lg:gap-8">
        <ToolSidebar />
        <div className="flex flex-1 flex-col gap-6">
          <ToolDescription />
          <ToolComments />
        </div>
      </div>
    </div>
  );
}
