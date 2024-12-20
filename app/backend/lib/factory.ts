import { Hono } from "hono";
import { onError } from "#lib/middleware";
import { securityMiddlewares, utilityMiddlewares } from "#lib/middleware";
import type { Env } from "./types";

export function createRouter() {
	return new Hono<Env>({
		strict: false,
	});
}

export function createApi() {
	return createRouter()
		.use(utilityMiddlewares)
		.use(securityMiddlewares)
		.onError((error) => onError(error));
}
