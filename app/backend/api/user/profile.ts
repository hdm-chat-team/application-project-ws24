import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import { utapi } from "#api/uploadthing/index";
import { updateUserProfile, updateUserProfileSchema } from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const profileRouter = createRouter()
	.put(
		"/",
		protectedRoute,
		zValidator("form", updateUserProfileSchema.pick({ displayName: true })),
		async (c) => {
			const profile = c.get("profile");
			const { displayName } = c.req.valid("form");

			const [updatedProfile] = await updateUserProfile.execute({
				id: profile.id,
				avatarUrl: profile.avatarUrl,
				displayName: displayName ?? profile.displayName,
			});

			return c.json({
				message: "profile updated!",
				data: updatedProfile,
			});
		},
	)
	.delete(
		"/avatar",
		protectedRoute,
		zValidator("json", updateUserProfileSchema.pick({ avatarUrl: true })),
		async (c) => {
			const { id } = c.get("profile");
			const { avatarUrl } = c.req.valid("json");

			const fileKey = avatarUrl.split("/").pop();

			if (!fileKey)
				throw new HTTPException(400, {
					message: "Invalid avatar URL",
				});

			await utapi.deleteFiles([fileKey]);

			const [updatedProfile] = await updateUserProfile.execute({
				id,
				avatarUrl: null,
			});

			return c.json({ success: true, data: updatedProfile });
		},
	);
