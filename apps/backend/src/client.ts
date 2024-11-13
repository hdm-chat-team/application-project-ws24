import type { hc } from "hono/client";
import type { apiRoutes } from "./app";

export type AppType = typeof apiRoutes;
export type ClientType = ReturnType<typeof hc<AppType>>;
