import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	selectUserChats,
	selectUserDataByUsername,
	selectUserSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { contactsRouter } from "./contact";
import { profileRouter } from "./profile";

export const userRouter = createRouter()
	.route("/contacts", contactsRouter)
	.route("/profile", profileRouter)
	.get("/", async (c) => {
		const user = c.get("user");
		const profile = c.get("profile");

		return c.json({ data: { user, profile } });
	})
	.get("/chats", protectedRoute, async (c) => {
		const { id } = c.get("user");

		const chats = await selectUserChats
			.execute({ id })
			.then((rows) => rows.map((row) => row.chat));

		return c.json({ data: chats });
	})
	.get(
		"/username/:username",
		zValidator("param", selectUserSchema.pick({ username: true })),
		async (c) => {
			const { username } = c.req.valid("param");

			const result = await selectUserDataByUsername.execute({
				username,
			});

			if (!result) throw new HTTPException(404, { message: "user not found" });

			const { profile, ...user } = result;
			if (!profile)
				throw new HTTPException(404, { message: "user profile not found" });

			return c.json({ data: { user, profile } });
		},
	);
