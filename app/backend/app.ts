import { serveStatic } from "hono/bun";
import { createApi, createRouter } from "#lib/factory";
import { authRouter } from "./routes/auth";
import { chat } from "./routes/chat";

// * API
const apiRouter = createApi()
	.basePath("/api")
	.route("/auth", authRouter)
	.route("/chat", chat)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

const app = createRouter()
	.route("/", apiRouter)
	.use("*", serveStatic({ root: "./dist/client" }));

export default app;
export { apiRouter };
