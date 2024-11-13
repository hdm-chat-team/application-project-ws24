import type { hc } from "hono/client";
import type { routes } from "./app";

export type AppType = typeof routes;
export type ClientType = ReturnType<typeof hc<AppType>>;
