import { createApi, createRouter } from "#lib/create-app";
import { serveStatic } from "hono/bun";
import { chat } from "./routes/chat";

// * API
const api = createApi()
	.basePath("/api")
	.route("/chat", chat)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

// * SPA
const frontend = createRouter().use(serveStatic({ root: "./dist/client" }));

const app = createRouter().route("/", api).route("/", frontend);

export default app;
export { api };
