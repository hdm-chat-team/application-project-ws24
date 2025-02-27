import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	type UserWithProfile,
	selectChatsByMemberUserId,
	selectUserByUsernameOrEmail,
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
	.get("/", (c) => {
		const { user, profile } = c.var;
		const signedIn = !!(user && profile);

		return c.json(
			{
				message: `signed ${signedIn ? "in" : "out"}`,
				data: { user, profile },
			},
			signedIn ? 200 : 404,
		);
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
	.get("/search", zValidator("query", userSearchQuerySchema), async (c) => {
		const { search } = c.req.valid("query");

		const result = await selectUserByUsernameOrEmail.execute({
			search,
		});

		return c.json({
			data: result as UserWithProfile[],
			// ? TS can't infer the type properly even if manually checked before, so we just cast it
		});
	});
