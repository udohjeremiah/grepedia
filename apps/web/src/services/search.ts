import { apiClient } from "@/lib/api-client";
import {
  search200ResponseSchema,
  type SearchQueryString,
} from "@workspace/shared/schemas/search";

export async function search(params: SearchQueryString) {
  const searchParams = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => (typeof value === "string" ? value.trim() : value))
      .map(([key, value]) => [key, String(value)]),
  );

  const response = await apiClient.get(`/search?${searchParams.toString()}`);
  return search200ResponseSchema.parse(response.data);
}
