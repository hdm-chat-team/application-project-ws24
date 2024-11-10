import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { every } from "hono/combine";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "./lib/config";
import { errorHandler } from "./lib/middleware";
import { rest } from "./routes/rest";
import { ws } from "./routes/sockets";

// * App
const app = new Hono();

// * Middleware
app
	.use("/api/*", every(logger(), prettyJSON(), cors(config.cors)))
	.onError(errorHandler);

// * serve SPA
app.use(serveStatic({ root: "./dist/client" }));

// * Routes
export const routes = app
	.basePath("/api")
	.route("/ws", ws)
	.route("/rest", rest);

export default app;
