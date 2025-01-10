import { createRouteHandler } from "uploadthing/server";
import { createRouter } from "#api/factory";
import env from "#env";
import { protectedRoute } from "#lib/middleware";
import { uploadRouter } from "#lib/uploadthing";

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const router = createRouter().use(protectedRoute);
router.all("/", (context) => handlers(context.req.raw));

export const uploadthingRouter = router;
