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
import { githubLoginRouter } from "./routes/auth/github-login.ts";
import { authMiddleware } from "./routes/auth/middleware.ts";
import { chat } from "./routes/chat";

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

// * Routes
const apiRoutes = api
	.basePath("/api")
	.use(authMiddleware())
	.route("/chat", chat)
	.route("/login", githubLoginRouter)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

// * SPA
const frontend = new Hono().use(serveStatic({ root: "./dist/client" }));

// * Routes
const app = new Hono().route("/", api).route("/", frontend);

export default app;
export { apiRoutes };
