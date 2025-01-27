import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import type { GitHubUser } from "#auth/oauth";
import db from "#db";
import { chatMemberTable } from "./chats.sql";
import type { DB, Transaction } from "./types";
import { userProfileTable, userTable } from "./users.sql";

const insertUserSchema = createInsertSchema(userTable);
const selectUserSchema = createSelectSchema(userTable).omit({
	githubId: true,
});
type User = z.infer<typeof selectUserSchema>;

const deleteUserProfileImageSchema = z.object({
	avatarUrl: z.string().url(),
});
const insertUserProfileSchema = createInsertSchema(userProfileTable);

const updateUserProfileSchema = createUpdateSchema(userProfileTable, {
	displayName: z.string().nonempty(),
	avatarUrl: z.string().url().optional(),
}).pick({
	displayName: true,
	avatarUrl: true,
});

const selectUserProfileSchema = createSelectSchema(userProfileTable);
type UserProfile = z.infer<typeof selectUserProfileSchema>;

const userWithProfileSchema = selectUserSchema.extend({
	profile: selectUserProfileSchema,
});
type UserWithProfile = z.infer<typeof userWithProfileSchema>;

async function insertUserWithProfile(
	githubUser: GitHubUser,
	trx: Transaction | DB = db,
) {
	const {
		id,
		login: username,
		name: displayName,
		email,
		avatar_url: avatarUrl,
		html_url: htmlUrl,
	} = githubUser;
	const githubId = id.toString();
	return trx.transaction(async (innerTrx) => {
		const [user] = await innerTrx
			.insert(userTable)
			.values({
				githubId,
				username,
				email: email ?? "",
			})
			.onConflictDoUpdate({
				target: userTable.githubId,
				set: { username, email: email ?? "" },
			})
			.returning();

		if (!user) throw new Error("Failed to insert or update user");

		await innerTrx
			.insert(userProfileTable)
			.values({
				userId: user.id,
				displayName,
				avatarUrl,
				htmlUrl,
			})
			.onConflictDoUpdate({
				target: userProfileTable.userId,
				set: { displayName, avatarUrl, htmlUrl },
			});

		return user;
	});
}

const selectUserDataByUsername = db.query.userTable
	.findFirst({
		with: { profile: true },
		where: eq(userTable.username, sql.placeholder("username")),
	})
	.prepare("select_user_profile");

const selectUserWithProfile = db.query.userTable
	.findFirst({
		columns: { githubId: false },
		with: { profile: true },
		where: eq(userTable.id, sql.placeholder("id")),
	})
	.prepare("select_user_with_profile");

const updateUserProfile = db
	.update(userProfileTable)
	.set({
		avatarUrl: sql.placeholder("avatarUrl").getSQL(),
		displayName: sql.placeholder("displayName").getSQL(),
	})
	.where(eq(userProfileTable.id, sql.placeholder("id")))
	.returning()
	.prepare("update_profile_avatar");

const selectUserChats = db.query.chatMemberTable
	.findMany({
		columns: {},
		where: eq(chatMemberTable.userId, sql.placeholder("id")),
		with: {
			chat: true,
		},
	})
	.prepare("select_user_chats");

export {
	// * User schemas
	insertUserSchema,
	selectUserSchema,
	selectUserProfileSchema,
	updateUserProfileSchema,
	userWithProfileSchema,
	deleteUserProfileImageSchema,
	// * User queries
	selectUserWithProfile,
	selectUserDataByUsername,
	selectUserChats,
	insertUserProfileSchema,
	// * User functions
	updateUserProfile,
	insertUserWithProfile,
};
export type { User, UserProfile, UserWithProfile };
