import { useMutation } from "@tanstack/react-query";
import { SearchQueryString } from "@workspace/shared/schemas/search/search";

import { search } from "@/services/search/search";

export const useSearchTools = () => {
  return useMutation({
    mutationFn: (queryString: SearchQueryString) => search(queryString),
    mutationKey: ["lists", "search"],
  });
};
