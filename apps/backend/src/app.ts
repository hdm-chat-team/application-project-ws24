import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import type { hc } from "hono/client";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// * App
const app = new Hono();

// * Middleware
app
	.use("/api", logger())
	.use(prettyJSON({ space: 2 }))
	.onError(async (error) => {
		if (!(error instanceof HTTPException))
			return new Response(error.message, {
				status: 500,
				statusText: `Internal error: ${error.cause}`,
			});
		return error.getResponse();
	});

// * serve SPA
app.use(serveStatic({ root: "./dist/client" }));

// * Routes
const routes = app.basePath("/api").get("/", (c) => {
	return c.text("Hello Hono!");
});

// * exports
export default app;

export type AppType = typeof routes;
export type ClientType = ReturnType<typeof hc<AppType>>;
