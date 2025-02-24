import { type Env as E, Hono } from "hono";
import type { Env } from "#api/app.env";
import { onError } from "#lib/middleware";
import { securityMiddlewares, utilityMiddlewares } from "#lib/middleware";

export const createRouter = <V = E["Variables"]>() =>
	new Hono<Env & { Variables: V }>({
		strict: false,
	});

export const createApi = () =>
	createRouter()
		.use(utilityMiddlewares)
		.use(securityMiddlewares)
		.onError((error) => onError(error));
