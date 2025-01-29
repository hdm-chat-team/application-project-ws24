import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { DatabaseError } from "pg";
import { createRouter } from "#api/factory";
import { utapi } from "#api/uploadthing/index";
import { selectContactsByUserId } from "#db/contacts";
import {
	deleteUserProfileImageSchema,
	selectUserChats,
	selectUserDataByUsername,
	selectUserSchema,
	updateUserProfile,
	updateUserProfileSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { contactRouter } from "./contact";

export const userRouter = createRouter()
	.route("/contact", contactRouter)
	.get("/contacts", protectedRoute, async (c) => {
		const { id } = c.get("user");

		const contacts = await selectContactsByUserId
			.execute({ userId: id })
			.catch((error: DatabaseError) => {
				throw new HTTPException(400, {
					message: error.message,
					cause: error.cause,
				});
			});

		return c.json({ data: contacts });
	})
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

			const result = await selectUserDataByUsername.execute({
				username,
			});

			if (!result) throw new HTTPException(404, { message: "user not found" });

			const { profile, ...user } = result;
			if (!profile)
				throw new HTTPException(404, { message: "profile not found" });

			return c.json({ data: { user, profile } });
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
