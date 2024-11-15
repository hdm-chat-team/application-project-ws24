import type { hc } from "hono/client";
import type { apiRoutes } from "./app";

export type ApiType = typeof apiRoutes;
export type ClientType = ReturnType<typeof hc<ApiType>>;
