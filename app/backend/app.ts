import { createApi, createRouter } from "#lib/factory";
import { serveStatic } from "hono/bun";
import { authRouter } from "./routes/auth";
import { socketRouter } from "./routes/socket";

// * API
const apiRouter = createApi();

const apiRoutes = apiRouter
	.basePath("/api")
	.route("/auth", authRouter)
	.route("/socket", socketRouter)
	.get("/", (c) => {
		return c.text("Connected!");
	});

const app = createRouter()
	.route("/", apiRouter)
	.get("*", serveStatic({ root: "dist/client" }))
	.get("*", serveStatic({ path: "index.html" }));

export default app;

// * RPC client type
export type ApiType = typeof apiRoutes;
