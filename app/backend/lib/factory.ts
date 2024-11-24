import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import env from "#env";
import { authMiddleware } from "./middleware";
import type { Env } from "./types";

const origin =
	env.NODE_ENV === "development"
		? ["http://localhost:5173", "http://localhost:3000"]
		: ["http://localhost:3000"];

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
				maxAge: env.NODE_ENV === "development" ? undefined : 3600,
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
