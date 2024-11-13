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
import { githubLoginRouter } from "./routes/auth/github.ts";
import { rest } from "./routes/rest";
import { ws } from "./routes/sockets";

// * App
const app = new Hono();

// * Middleware
app
	.use(
		"/api/*",
		every(
			requestId(),
			logger(),
			prettyJSON(),
			cors(config.cors),
			csrf(config.csrf),
		),
	)
	.onError(errorHandler);

// * serve SPA
app.use(serveStatic({ root: "./dist/client" }));
app.route("/test", githubLoginRouter);

// * Routes
export const routes = app
	.basePath("/api")
	.route("/ws", ws)
	.route("/rest", rest);

export default app;
