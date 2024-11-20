import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { config } from "./config";
import type { Context } from "./types";

export function createRouter() {
	return new Hono<Context>({
		strict: false,
	});
}

export function createApi() {
	return createRouter()
		.use(cors(config.cors))
		.use(csrf(config.csrf))
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
