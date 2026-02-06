import { env } from "@/env";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: env.VITE_SERVER_API_URL,
  headers: { "Content-Type": "application/json" },
});
