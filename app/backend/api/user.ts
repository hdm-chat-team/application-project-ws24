import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	getUserProfile,
	updateUserProfile,
	updateUserProfileSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const profileRouter = createRouter()
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) {
			throw new HTTPException(404, { message: "profile not found" });
		}
		return c.json(data);
	})
	.put(
		"/me",
		protectedRoute,
		zValidator("form", updateUserProfileSchema),
		async (c) => {
			const user = c.get("user");
			const { avatarUrl, displayName } = c.req.valid("form");

			const updatedProfile = await updateUserProfile(user.id, {
				avatarUrl,
				displayName,
			});

			return c.json({
				message: "profile updated!",
				data: updatedProfile,
			});
		},
	)
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await getUserProfile.execute({ id });
			if (!userData) {
				throw new HTTPException(404, { message: "profile not found" });
			}
			return c.json(userData);
		},
	);
