import { serveStatic } from "hono/bun";
import { createApi, createRouter } from "#api/factory";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { socketRouter } from "./socket";
import { uploadthingRouter } from "./uploadthing";
import { userRouter } from "./user";

// * API
const apiRouter = createApi();

const apiRoutes = apiRouter
	.basePath("/api")
	.route("/auth", authRouter)
	.route("/socket", socketRouter)
	.route("/chat", chatRouter)
	.route("/user", userRouter)
	.route("/uploadthing", uploadthingRouter)
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
