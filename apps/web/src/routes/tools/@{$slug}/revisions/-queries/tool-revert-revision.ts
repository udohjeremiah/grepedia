import type { RevertToolRevisionBody } from "@workspace/shared/schemas/tools/revisions/revert-tool-revision";

import { useMutation } from "@tanstack/react-query";

import { revertToolRevision } from "@/services/tools/revert-tool-revision";

import { toolQueryOptions } from "../../-queries/tool";

export function useToolRevertRevision(slug: string) {
  return useMutation({
    mutationFn: (body: RevertToolRevisionBody) =>
      revertToolRevision({ body, params: { slug } }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
