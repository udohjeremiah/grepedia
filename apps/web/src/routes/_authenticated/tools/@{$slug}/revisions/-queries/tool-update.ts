import type { UpdateToolBody } from "@workspace/shared/schemas/tools/update-tool";

import { useMutation } from "@tanstack/react-query";

import { updateTool } from "@/services/tools/update-tool";

import { toolQueryOptions } from "../../-queries/tool";

export function useToolUpdate(slug: string) {
  return useMutation({
    mutationFn: (body: UpdateToolBody) =>
      updateTool({ body, params: { slug } }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
