import { zValidator } from "@hono/zod-validator";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../db/db";
import { userProfileTable } from "../../db/schema.sql";
import { createRouter } from "../../lib/factory";
import { protectedRoute } from "../../lib/middleware";
import { GUIDParamSchema, profileEditSchema } from "./types";

//* Define the profile route

const profileRouter = createRouter()

	//* Endpoint to get the current user's profile
	// * Protected route to ensure the user is authenticated
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) {
			throw new HTTPException(404, { message: "profile not found" });
		}
		return c.json(data);
	})

	//* Endpoint to get a profile by id
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", GUIDParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await getUserProfile.execute({ id });
			if (!userData) {
				throw new HTTPException(404, { message: "profile not found" });
			}
			return c.json(userData);
		},
	)

	//* Endpoint to update the profile
	.put(
		"/me",
		protectedRoute,
		zValidator("form", profileEditSchema),
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
	);

//* Prepared statement for getting user profiles
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

export default profileRouter;
export type ProfileRoute = typeof profileRouter;
