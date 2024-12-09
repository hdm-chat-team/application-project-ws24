import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import env, { DEV } from "#env";
import { authMiddleware, limiter, onError } from "./middleware";
import type { Env } from "./types";

const origin = DEV
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
				maxAge: DEV ? undefined : 3600,
			}),
		)
		.use(csrf({ origin }))
		.use(requestId())
		.use(logger())
		.use(prettyJSON())
		.use(authMiddleware)
		.use(limiter)
		.onError((error) => onError(error));
}
