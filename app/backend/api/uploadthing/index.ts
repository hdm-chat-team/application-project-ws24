import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "#lib/uploadthing";
import env from "#env";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const router = createRouter().use(protectedRoute);
router.all("/", (context) => handlers(context.req.raw));

export const uploadthingRouter = router;
