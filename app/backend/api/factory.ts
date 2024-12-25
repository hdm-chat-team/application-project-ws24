import { Hono } from "hono";
import type { Context } from "#api/context";
import { onError } from "#lib/middleware";
import { securityMiddlewares, utilityMiddlewares } from "#lib/middleware";

export function createRouter() {
	return new Hono<Context>({
		strict: false,
	});
}

export function createApi() {
	return createRouter()
		.use(utilityMiddlewares)
		.use(securityMiddlewares)
		.onError((error) => onError(error));
}
