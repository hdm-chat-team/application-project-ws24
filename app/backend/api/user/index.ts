import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { UTApi } from "uploadthing/server";
import { createRouter } from "#api/factory";
import {
	deleteUserProfileImageSchema,
	selectUserChats,
	selectUserProfile,
	updateUserProfile,
	updateUserProfileSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

const utApi = new UTApi();

export const profileRouter = createRouter()
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
			.then((chats) => chats.map((chat) => chat.chat));

		return c.json({ data: chats });
	})
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await selectUserProfile.execute({ id });
			if (!userData) {
				throw new HTTPException(404, { message: "profile not found" });
			}
			return c.json({ data: userData });
		},
	)
	.delete(
		"/avatar",
		protectedRoute,
		zValidator("json", deleteUserProfileImageSchema),
		async (c) => {
			try {
				const { avatarUrl } = c.req.valid("json");
				const fileKey = avatarUrl.split("/").pop();

				if (fileKey) {
					await utApi.deleteFiles([fileKey], { keyType: "fileKey" });
					return c.json({ success: true });
				}

				throw new HTTPException(400, {
					message: "Invalid avatar URL",
				});
			} catch (error) {
				throw new HTTPException(500);
			}
		},
	);
