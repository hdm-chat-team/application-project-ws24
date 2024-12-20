import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { userProfileTable, userTable } from "./users.sql";

const insertUserSchema = createInsertSchema(userTable);
const selectUserSchema = createSelectSchema(userTable);
type User = z.infer<typeof selectUserSchema>;

const insertUserProfileSchema = createInsertSchema(userProfileTable);
const updateUserProfileSchema = createUpdateSchema(userProfileTable).omit({
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
		avatar_url: sql.placeholder("avatar_url"),
		html_url: sql.placeholder("html_url"),
	})
	.returning({ id: userProfileTable.id });

const selectUserByGithubId = db.query.userTable
	.findFirst({
		where: eq(userTable.githubId, sql.placeholder("githubId")),
	})
	.prepare("select_user_by_github_id");

export {
	// * User schemas
	insertUserSchema,
	selectUserSchema,
	insertUserProfileSchema,
	updateUserProfileSchema,
	selectUserProfileSchema,
	// * User queries
	insertUser,
	insertProfile,
	selectUserByGithubId,
};
export type { User, UserProfile };
