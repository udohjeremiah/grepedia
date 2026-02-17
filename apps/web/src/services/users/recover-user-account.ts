import {
  RecoverUserAccountBody,
  recoverUserAccountBodySchema,
  RecoverUserAccountParams,
  recoverUserAccountParamsSchema,
  recoverUserAccountResponseSchemas,
} from "@workspace/shared/schemas/users/recover-user-account";

import { apiClient, requestWithAuth } from "@/lib/api-client";

type RecoverUserAccount = {
  body: RecoverUserAccountBody;
  params: RecoverUserAccountParams;
};

export async function recoverUserAccount({ body, params }: RecoverUserAccount) {
  const { id } = recoverUserAccountParamsSchema.parse(params);
  const parsedBody = recoverUserAccountBodySchema.parse(body);

  const response = await apiClient.post(
    `/users/${id}/recover-account`,
    parsedBody,
    requestWithAuth(),
  );

  return recoverUserAccountResponseSchemas[200].parse(response.data);
}
