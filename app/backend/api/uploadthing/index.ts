import { Hono } from "hono";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "#lib/uploadthing";
import env from "#env";

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const app = new Hono();
app.all("/", (context) => handlers(context.req.raw));

export const uploadthingRouter = app;
