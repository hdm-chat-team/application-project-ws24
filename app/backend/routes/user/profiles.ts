import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { eq, sql } from "drizzle-orm";
import db from "../../db/db";
import { userProfileTable } from "../../db/schema.sql";
import { profileEditSchema, GUIDParamSchema } from "./types";
import { protectedRoute, limiter } from "../../lib/middleware";
import type { User, Session } from "#db/schema.sql";

//* Define the profile route

const profileRoute = new Hono<{
	Variables: { user: User; session: Session };
}>();

profileRoute
	.use("*", limiter)

	//* Endpoint to get the current user's profile
	// * Protected route to ensure the user is authenticated
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) {
			throw new HTTPException(404, { message: "profile not found" });
		}
		return c.json({ data });
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
			return c.json({ data: userData });
		},
	)

	//* Endpoint to update the profile
	.put(
		"/me",
		protectedRoute,
		zValidator("json", profileEditSchema),
		async (c) => {
			const user = c.get("user");
			const profile = c.req.valid("json");
			await updateUserProfile.execute({ id: user.id, ...profile });
			const updatedProfile = await getUserProfile.execute({ id: user.id });
			return c.json({ message: "profile updated", data: updatedProfile });
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
	.prepare("update_user_profile");

export default profileRoute;
export type ProfileRoute = typeof profileRoute;
