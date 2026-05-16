import { useMutation } from "@tanstack/react-query";

import { generateTool } from "@/services/tools/generate-tool";

export const useGenerateTool = () => {
  return useMutation({
    mutationFn: generateTool,
    mutationKey: ["tools", "generate"],
  });
};
