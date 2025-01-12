import { createRouteHandler } from "uploadthing/server";
import { createRouter } from "#api/factory";
import { uploadRouter } from "#api/user/index";
import { protectedRoute } from "#lib/middleware";
import env from "#env";

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

const router = createRouter();
router.all("/", protectedRoute, (c) => handlers(c.req.raw));

export const uploadthingRouter = router;
