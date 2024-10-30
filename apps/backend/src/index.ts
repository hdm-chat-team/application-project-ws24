import { Hono } from "hono";
import type { hc } from "hono/client";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

const routes = app.basePath("/api").get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
export type AppType = typeof routes;
export type ClientType = ReturnType<typeof hc<AppType>>;
