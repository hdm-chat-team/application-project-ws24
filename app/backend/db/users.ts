import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import db from "#db";
import { userProfileTable, userTable } from "./users.sql";

const insertUserSchema = createInsertSchema(userTable);
const selectUserSchema = createSelectSchema(userTable);
type User = z.infer<typeof selectUserSchema>;

const insertUserProfileSchema = createInsertSchema(userProfileTable);
const updateUserProfileSchema = createUpdateSchema(userProfileTable, {
	avatarUrl: z.string().nonempty(),
	displayName: z.string().nonempty(),
}).omit({
	userId: true,
	createdAt: true,
	id: true,
	updatedAt: true,
});
const selectUserProfileSchema = createSelectSchema(userProfileTable);
type UserProfile = z.infer<typeof selectUserProfileSchema>;

const insertUser = db
	.insert(userTable)
	.values({
		githubId: sql.placeholder("githubId"),
		username: sql.placeholder("username"),
		email: sql.placeholder("email"),
	})
	.returning({ id: userTable.id })
	.prepare("insert_user");

const insertProfile = db
	.insert(userProfileTable)
	.values({
		userId: sql.placeholder("userId"),
		displayName: sql.placeholder("displayname"),
		avatarUrl: sql.placeholder("avatar_url"),
		htmlUrl: sql.placeholder("html_url"),
	})
	.returning({ id: userProfileTable.id });

const getUserProfile = db.query.userProfileTable
	.findFirst({
		with: { owner: true },
		where: eq(userProfileTable.userId, sql.placeholder("id")),
	})
	.prepare("get_user_profile");

async function updateUserProfile(
	userId: string,
	newValues: {
		avatarUrl: string;
		displayName: string;
	},
) {
	const { avatarUrl, displayName } = newValues;
	return await db
		.insert(userProfileTable)
		.values({
			userId: userId,
			displayName,
			avatarUrl,
		})
		.onConflictDoUpdate({
			target: userProfileTable.userId,
			set: { avatarUrl, displayName },
		})
		.returning()
		.then((rows) => rows[0]);
}

const selectUserByGithubId = db.query.userTable
	.findFirst({
		where: eq(userTable.githubId, sql.placeholder("githubId")),
	})
	.prepare("select_user_by_github_id");

export {
	// * User schemas
	insertUserSchema,
	selectUserByGithubId,
	selectUserProfileSchema,
	selectUserSchema,
	updateUserProfileSchema,
	// * User queries
	getUserProfile,
	insertProfile,
	insertUser,
	insertUserProfileSchema,
	updateUserProfile,
};
export type { User, UserProfile };
