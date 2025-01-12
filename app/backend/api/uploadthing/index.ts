import {
	createRouteHandler,
	type FileRouter,
	createUploadthing,
} from "uploadthing/server";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";
import env from "#env";

// * UploadThing configuration

const f = createUploadthing();

export const uploadRouter = {
	imageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	}).onUploadComplete((data) => {
		console.log("upload completed", data);
	}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const router = createRouter();
router.all("/", protectedRoute, (c) => handlers(c.req.raw));

export const uploadthingRouter = router;
