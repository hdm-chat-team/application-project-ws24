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

// * Routes
export const routes = app
	.basePath("/api")
	.route("/chat", chat)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

export default app;
