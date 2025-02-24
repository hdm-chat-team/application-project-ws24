import { serveStatic } from "hono/bun";
import { createApi, createRouter } from "#api/factory";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { messageRouter } from "./message";
import { socketRouter } from "./socket";
import { uploadthingRouter } from "./uploadthing";
import { userRouter } from "./user";

// * API
const apiRouter = createApi();

const apiRoutes = apiRouter
	.basePath("/api")
	.route("/socket", socketRouter)
	.route("/auth", authRouter)
	.route("/uploadthing", uploadthingRouter)
	.route("/user", userRouter)
	.route("/chat", chatRouter)
	.route("/message", messageRouter)
	.get("/", (c) => {
		return c.text("Connected!");
	});

export const app = createRouter()
	.route("/", apiRouter)
	.get("*", serveStatic({ root: "dist/client" }))
	.get("*", serveStatic({ path: "index.html" }));

// * RPC client type
export type ApiType = typeof apiRoutes;
