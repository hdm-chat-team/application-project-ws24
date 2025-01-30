import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import { updateUserProfile, updateUserProfileSchema } from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const updateProfileFormSchema = updateUserProfileSchema.pick({
	avatarUrl: true,
	displayName: true,
});

export const profileRouter = createRouter().put(
	"/",
	protectedRoute,
	zValidator("form", updateProfileFormSchema),
	async (c) => {
		const {
			id,
			avatarUrl: currentAvatarUrl,
			displayName: currentDisplayName,
		} = c.get("profile");
		const { avatarUrl, displayName } = c.req.valid("form");

		const [updatedProfile] = await updateUserProfile
			.execute({
				id,
				avatarUrl: avatarUrl ?? currentAvatarUrl,
				displayName: displayName ?? currentDisplayName,
			})
			.catch((error) => {
				throw new HTTPException(500, {
					message: error.message,
					cause: error.cause,
				});
			});

		return c.json({
			message: "profile updated!",
			data: updatedProfile,
		});
	},
);
