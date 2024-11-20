import { serveStatic } from "hono/bun";
import { createApi, createRouter } from "#lib/factory";
import { chat } from "./routes/chat";
import { githubLoginRouter } from "./routes/auth/github";

// * API
const api = createApi()
	.basePath("/api")
	.route("/login", githubLoginRouter)
	.route("/chat", chat)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	});

// * SPA
const frontend = createRouter().use(serveStatic({ root: "./dist/client" }));

const app = createRouter().route("/", api).route("/", frontend);

export default app;
export { api };
