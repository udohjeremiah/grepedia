import type { AxiosRequestConfig } from "axios";

import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import axios from "axios";

import { env } from "@/env";

const rawApiClient = axios.create({
  baseURL: env.VITE_SERVER_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const getServerCookie = createIsomorphicFn()
  .server(() => getRequestHeaders().get("cookie") ?? undefined)
  .client(() => {});

function resolveAuthConfig(
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  const cookie = getServerCookie();

  if (!cookie) return config;

  return {
    ...config,
    headers: {
      ...config.headers,
      cookie,
    },
  };
}

export const apiClient = {
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return rawApiClient.delete<T>(url, resolveAuthConfig(config));
  },

  async get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return rawApiClient.get<T>(url, resolveAuthConfig(config));
  },

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return rawApiClient.patch<T>(url, data, resolveAuthConfig(config));
  },

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return rawApiClient.post<T>(url, data, resolveAuthConfig(config));
  },

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) {
    return rawApiClient.put<T>(url, data, resolveAuthConfig(config));
  },

  async request<T = unknown>(config: AxiosRequestConfig) {
    return rawApiClient.request<T>(resolveAuthConfig(config));
  },
};
