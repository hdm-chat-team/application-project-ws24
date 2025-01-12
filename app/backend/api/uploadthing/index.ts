import {
	type FileRouter as FR,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import { createRouter } from "#api/factory";
import env from "#env";
import { protectedRoute } from "#lib/middleware";

const f = createUploadthing();

export const uploadRouter = {
	avatar: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	}).onUploadComplete((data) => {
		console.log("upload completed", data);
	}),
} satisfies FR;

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

export const uploadthingRouter = createRouter().all("/", protectedRoute, (c) =>
	handlers(c.req.raw),
);

export type FileRouter = typeof uploadRouter;
