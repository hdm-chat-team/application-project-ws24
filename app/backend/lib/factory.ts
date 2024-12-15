import { Hono } from "hono";
import { onError } from "./middleware";
import { securityMiddlewares, utilityMiddlewares } from "./middleware";
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
