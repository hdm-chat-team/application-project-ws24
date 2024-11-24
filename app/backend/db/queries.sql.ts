import { eq, sql } from "drizzle-orm";
import db from "./db";
import { sessionTable, userProfileTable, userTable } from "./schema.sql";

// * Session Queries
export const insertSession = db
	.insert(sessionTable)
	.values({
		id: sql.placeholder("id"),
		userId: sql.placeholder("userId"),
		expiresAt: sql.placeholder("expiresAt"),
	})
	.prepare("insert_session");

export const selectSessionById = db.query.sessionTable
	.findFirst({
		where: eq(sessionTable.id, sql.placeholder("sessionId")),
		with: { user: true },
	})
	.prepare("select_session_by_id");

export const deleteSessionById = db
	.delete(sessionTable)
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare("delete_session_by_id");

export const updateSessionExpiresAt = db
	.update(sessionTable)
	.set({
		expiresAt: sql.placeholder("expiresAt") as unknown as Date,
	})
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare("update_session_expires_at");

// * User Queries
export const insertUser = db
	.insert(userTable)
	.values({
		githubId: sql.placeholder("githubId"),
		username: sql.placeholder("username"),
		email: sql.placeholder("email"),
	})
	.returning({ id: userTable.id })
	.prepare("insert_user");

// * Profile Queries
export const insertProfile = db
	.insert(userProfileTable)
	.values({
		userId: sql.placeholder("userId"),
		displayName: sql.placeholder("displayname"),
		avatar_url: sql.placeholder("avatar_url"),
		html_url: sql.placeholder("html_url"),
	})
	.returning({ id: userProfileTable.id });

export const selectUserByGithubId = db.query.userTable
	.findFirst({
		where: eq(userTable.githubId, sql.placeholder("githubId")),
	})
	.prepare("select_user_by_github_id");
