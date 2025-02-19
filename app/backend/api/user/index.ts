import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	searchUsersByUsernameOrEmail,
	selectChatsByMemberUserId,
	selectUserDataByUsername,
	selectUserSchema,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { userSearchQuerySchema } from "#shared/types";
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

		const chats = await selectChatsByMemberUserId
			.execute({ userId: id })
			.then((rows) => rows.map(({ members, ...chat }) => chat));

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
	)
	.get("/search", zValidator("json", userSearchQuerySchema), async (c) => {
		const { search, page, pagesize } = c.req.valid("json");

		const searchResults = await searchUsersByUsernameOrEmail.execute({
			search: `%${search}%`,
			offset: (page - 1) * pagesize,
			limit: pagesize,
		});

		return c.json({ data: searchResults });
	});
