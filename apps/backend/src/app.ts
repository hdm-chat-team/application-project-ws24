import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { every } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { config } from "./lib/config";
import { errorHandler } from "./lib/middleware";
import { chat } from "./routes/chat";
import { githubLoginRouter } from "./routes/auth/github.ts";

// * API
const api = new Hono()
	.use(
		every(
			cors(config.cors),
			csrf(config.csrf),
			logger(),
			requestId(),
			prettyJSON(),
		),
	)
	.onError(errorHandler);

// * serve SPA
api.use(serveStatic({ root: "./dist/client" }));
api.route("/test", githubLoginRouter);

// * Routes
const apiRoutes = api
	.basePath("/api")
	.route("/chat", chat)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

// * SPA
const frontend = new Hono().use(serveStatic({ root: "./dist/client" }));

// * Routes
const app = new Hono().route("/", api).route("/", frontend);

export default app;
export { apiRoutes };
