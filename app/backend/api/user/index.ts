import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import { utapi } from "#api/uploadthing/index";
import {
	deleteUserProfileImageSchema,
	selectUserChats,
	selectUserDataByUsername,
	selectUserSchema,
	updateUserProfile,
	updateUserProfileSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const userRouter = createRouter()
	.put(
		"/profile",
		protectedRoute,
		zValidator("form", updateUserProfileSchema),
		async (c) => {
			const { id } = c.get("profile");
			const formData = c.req.valid("form");

			const [updatedProfile] = await updateUserProfile.execute({
				id,
				...formData,
			});

			return c.json({
				message: "profile updated!",
				data: updatedProfile,
			});
		},
	)
	.get("/chats", protectedRoute, async (c) => {
		const { id } = c.get("user");

		const chats = await selectUserChats
			.execute({ id })
			.then((rows) => rows.map((row) => row.chat));

		return c.json({ data: chats });
	})
	.get(
		"/username/:username",
		protectedRoute,
		zValidator("param", selectUserSchema.pick({ username: true })),
		async (c) => {
			const { username } = c.req.valid("param");

			// ? Are there any fields we should NOT be returning?
			const userData = await selectUserDataByUsername.execute({ username });

			if (!userData?.profile)
				throw new HTTPException(404, { message: "profile not found" });

			return c.json({ data: userData });
		},
	)
	.delete(
		"/avatar",
		protectedRoute,
		zValidator("json", deleteUserProfileImageSchema),
		async (c) => {
			const { avatarUrl } = c.req.valid("json");
			const { id } = c.get("profile");
			const fileKey = avatarUrl.split("/").pop();

			if (!fileKey)
				throw new HTTPException(400, {
					message: "Invalid avatar URL",
				});

			await utapi.deleteFiles([fileKey]).catch(() => {
				throw new HTTPException(500, {
					message: "Failed to delete avatar",
				});
			});
			const [updatedProfile] = await updateUserProfile.execute({
				id,
				avatarUrl: null,
			});

			return c.json({ success: true, data: updatedProfile });
		},
	);
