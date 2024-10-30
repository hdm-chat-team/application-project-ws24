import { Hono } from "hono";
import type { hc } from "hono/client";

const app = new Hono();

const routes = app.basePath("/api").get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
export type AppType = typeof routes;
export type ClientType = ReturnType<typeof hc<AppType>>;
