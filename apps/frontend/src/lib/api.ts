import type { AppType } from "@application-project-ws24/backend/client";
import { hc } from "hono/client";

const { api } = hc<AppType>("/");

export default api;
