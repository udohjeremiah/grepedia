import type { SubmitToolClaimBody } from "@workspace/shared/schemas/tools/submit-tool-claim";

import { useMutation } from "@tanstack/react-query";

import { submitToolClaim } from "@/services/tools/submit-tool-claim";

import { toolQueryOptions } from "../../-queries/tool";

export function useToolSubmitClaim(slug: string) {
  return useMutation({
    mutationFn: (body: SubmitToolClaimBody) =>
      submitToolClaim({ body, params: { slug } }),
    mutationKey: toolQueryOptions({ slug }).queryKey,
  });
}
