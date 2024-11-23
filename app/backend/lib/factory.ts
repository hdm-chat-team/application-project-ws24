import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { authMiddleware } from "./middleware";
import type { Env } from "./types";

const { NODE_ENV, ALLOWED_ORIGINS } = Bun.env;
const isDev = NODE_ENV === "development";

const origin = isDev
	? ["http://localhost:5173", "http://localhost:3000"]
	: (ALLOWED_ORIGINS?.split(",").map((o) => {
			const origin = o.trim();
			if (!origin.startsWith("https://")) {
				throw new Error("Production origins must use HTTPS");
			}
			return origin;
		}) ?? ["http://localhost:3000"]);

export function createRouter() {
	return new Hono<Env>({
		strict: false,
	});
}

export function createApi() {
	return createRouter()
		.use(
			cors({
				origin,
				credentials: true,
				/* allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], */
				/* allowHeaders: ["content-type", "authorization", "cookie"], */
				maxAge: isDev ? undefined : 3600,
				/* exposeHeaders: ["set-cookie"], */
			}),
		)
		.use(csrf({ origin }))
		.use(authMiddleware)
		.use(logger())
		.use(requestId())
		.use(prettyJSON())
		.onError(async (error) => {
			console.error(error);
			if (!(error instanceof HTTPException)) {
				return new Response(error.message, {
					status: 500,
					statusText: `Internal error: ${error.cause}`,
				});
			}
			return error.getResponse();
		});
}
