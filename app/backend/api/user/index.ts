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

// * Create a new UploadThing API instance

const utApi = new UTApi();

export const profileRouter = createRouter()
	.put(
		"/profile",
		protectedRoute,
		zValidator("form", updateUserProfileSchema),
		async (c) => {
			const user = c.get("user");
			const { displayName, avatarUrl } = c.req.valid("form");

			const updatedProfile = await updateUserProfile(user.id, {
				displayName,
				avatarUrl,
			}).catch((error) => {
				throw new HTTPException(400, { message: error.message });
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
	.post(
		"/delete-profile-image",
		protectedRoute,
		zValidator("json", deleteUserProfileImageSchema),
		async (c) => {
			try {
				const { avatarUrl } = c.req.valid("json");
				const fileKey = avatarUrl.split("/").pop();

				if (!fileKey) {
					throw new HTTPException(400);
				}

				await utApi.deleteFiles([fileKey], { keyType: "fileKey" });
				return c.json({ success: true });
			} catch (error) {
				throw new HTTPException(500);
			}
		},
	);
