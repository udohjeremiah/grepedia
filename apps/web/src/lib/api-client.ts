import type { AxiosRequestConfig } from "axios";

import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import axios from "axios";

import { env } from "@/env";

export const apiClient = axios.create({
  baseURL: env.VITE_SERVER_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const getServerCookie = createIsomorphicFn()
  .server(() => getRequestHeaders().get("cookie") ?? undefined)
  .client(() => {});

export function requestWithAuth(
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  const cookie = getServerCookie();

  if (!cookie) return config;

  return {
    ...config,
    headers: {
      cookie,
      ...config.headers,
    },
  };
}
