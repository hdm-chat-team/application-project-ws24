import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	selectUserChats,
	selectUserProfile,
	updateUserProfile,
	updateUserProfileSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const profileRouter = createRouter()
	.get("/profile", protectedRoute, async (c) => {
		const { id } = c.get("user");
		const data = await selectUserProfile.execute({ id });
		if (!data) {
			throw new HTTPException(404, { message: "profile not found" });
		}
		return c.json(data);
	})
	.put(
		"/profile",
		protectedRoute,
		zValidator("form", updateUserProfileSchema),
		async (c) => {
			const user = c.get("user");
			const { avatarUrl, displayName } = c.req.valid("form");

			const updatedProfile = await updateUserProfile(user.id, {
				avatarUrl,
				displayName,
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
	);
