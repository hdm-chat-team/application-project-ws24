import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import db from "#db";
import { updateUserProfileSchema } from "#db/users";
import { userProfileTable } from "#db/users.sql";
import { protectedRoute } from "#lib/middleware";

export const profileRouter = createRouter()
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) {
			throw new HTTPException(404, { message: "profile not found" });
		}
		return c.json(data);
	})
	.put(
		"/me",
		protectedRoute,
		zValidator("form", updateUserProfileSchema),
		async (c) => {
			const user = c.get("user");
			const profile = c.req.valid("form");

			const updatedProfile = await updateUserProfile.execute({
				id: user.id,
				...profile,
			});

			return c.json({
				message: "profile updated!",
				data: updatedProfile[0],
			});
		},
	)
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await getUserProfile.execute({ id });
			if (!userData) {
				throw new HTTPException(404, { message: "profile not found" });
			}
			return c.json(userData);
		},
	);

const getUserProfile = db.query.userProfileTable
	.findFirst({
		with: { owner: true },
		where: eq(userProfileTable.userId, sql.placeholder("id")),
	})
	.prepare("get_user_profile");

const updateUserProfile = db
	.update(userProfileTable)
	.set({
		displayName: sql.placeholder("displayName") as unknown as string,
		avatar_url: sql.placeholder("avatar_url") as unknown as string,
	})
	.where(eq(userProfileTable.userId, sql.placeholder("id")))
	.returning()
	.prepare("update_user_profile");
