import {
	type FileRouter,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import { createRouter } from "#api/factory";
import env from "#env";
import { protectedRoute } from "#lib/middleware";

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

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const router = createRouter();
router.all("/", protectedRoute, (c) => handlers(c.req.raw));

export const uploadthingRouter = router;
export type OurFileRouter = typeof uploadRouter;
