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
import type { HTTPResponseError } from "hono/types";

const origin =
	env.NODE_ENV === "development"
		? ["http://localhost:5173", `http://localhost:${env.PORT}`]
		: [`http://localhost:${env.PORT}`];

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
				maxAge: env.NODE_ENV === "development" ? undefined : 3600,
			}),
		)
		.use(csrf({ origin }))
		.use(authMiddleware)
		.use(logger())
		.use(requestId())
		.use(prettyJSON())
		.onError((error) => onError(error));
}

// Change to export the onError function
export async function onError(error: Error | HTTPResponseError) {
	console.error(error);
	if (!(error instanceof HTTPException)) {
		return new Response(error.message, {
			status: 500,
			statusText: `Internal error: ${error.cause}`,
		});
	}
	return error.getResponse();
}
