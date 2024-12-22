import { serveStatic } from "hono/bun";
import { createApi, createRouter } from "#lib/factory";
import { authRouter } from "./routes/auth";
import { chatRouter } from "./routes/chat";
import profileRouter from "./routes/user/profiles";

// * API
const apiRouter = createApi();

const apiRoutes = apiRouter
	.basePath("/api")
	.route("/auth", authRouter)
	.route("/chat", chatRouter)
	.route("/profile", profileRouter)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

const app = createRouter()
	.route("/", apiRouter)
	.get("*", serveStatic({ root: "dist/client" }))
	.get("*", serveStatic({ path: "index.html" }));

export default app;

// * RPC client type
export type ApiType = typeof apiRoutes;
