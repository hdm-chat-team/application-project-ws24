import { createId } from "@application-project-ws24/cuid";
import { contextStorage, getContext } from "hono/context-storage";
import {
	type FileRouter as FR,
	UTFiles,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import env from "#env";

const routeBuilder = createUploadthing();

export const uploadRouter = {
	avatar: routeBuilder({
		image: { maxFileSize: "4MB", minFileCount: 1, maxFileCount: 1 },
	})
		.middleware(async ({ files }) => {
			const { user, session } = getContext<Env>().var;
			if (!(user && session)) throw new Error("Unauthorized");

			const fileOverrides = files.map((file) => ({
				...file,
				name: `${user.id}:avatar`,
				customId: createId(),
			}));

			return { [UTFiles]: fileOverrides };
		})
		.onUploadComplete(({ file: { url } }) => ({
			url,
		})),
	attachment: routeBuilder({
		image: { maxFileSize: "4MB", maxFileCount: 4 },
		video: { maxFileSize: "16MB", maxFileCount: 1 },
		pdf: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async ({ files }) => {
			const { user, session } = getContext<Env>().var;
			if (!(user && session)) throw new Error("Unauthorized");

			const fileOverrides = files.map((file) => ({
				...file,
				name: `${user.id}:attachment`,
				customId: createId(),
			}));

			return { [UTFiles]: fileOverrides };
		})
		.onUploadComplete(async ({ file: { url } }) => ({
			url,
		})),
} satisfies FR;

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

export const uploadthingRouter = createRouter()
	.use(contextStorage())
	.all("/", (c) => handlers(c.req.raw));

export type FileRouter = typeof uploadRouter;
