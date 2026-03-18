import type {
  SubmitToolClaimBody,
  SubmitToolClaimParams,
} from "@workspace/shared/schemas/tools/submit-tool-claim";

import {
  submitToolClaimBodySchema,
  submitToolClaimParamsSchema,
  submitToolClaimResponseSchemas,
} from "@workspace/shared/schemas/tools/submit-tool-claim";

import { apiClient } from "@/lib/api-client";

type SubmitToolClaimInput = {
  body: SubmitToolClaimBody;
  params: SubmitToolClaimParams;
};

export async function submitToolClaim({ body, params }: SubmitToolClaimInput) {
  const { slug } = submitToolClaimParamsSchema.parse(params);
  const parsedBody = submitToolClaimBodySchema.parse(body);
  const response = await apiClient.post(`/tools/${slug}/claims`, parsedBody);
  return submitToolClaimResponseSchemas[201].parse(response.data);
}
