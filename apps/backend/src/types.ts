import type { routes } from "./app";
import type { hc } from "hono/client";

export type AppType = typeof routes;
export type ClientType = ReturnType<typeof hc<AppType>>;
