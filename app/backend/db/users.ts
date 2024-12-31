import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import type { GitHubUser } from "#auth/oauth";
import db from "#db";
import { userProfileTable, userTable } from "./users.sql";

const insertUserSchema = createInsertSchema(userTable);
const selectUserSchema = createSelectSchema(userTable).omit({
	githubId: true,
});
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

const userWithProfileSchema = z.object({
	...selectUserSchema.shape,
	profile: selectUserProfileSchema,
});
type UserWithProfile = z.infer<typeof userWithProfileSchema>;

async function insertUserWithProfile(githubUser: GitHubUser) {
	const {
		id,
		login: username,
		name: displayName,
		email,
		avatar_url: avatarUrl,
		html_url: htmlUrl,
	} = githubUser;
	const githubId = id.toString();
	return db.transaction(async (tx) => {
		const [user] = await tx
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

		if (!user) throw new Error("Failed to insert or get existing user");

		await tx
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

const selectUserProfile = db.query.userProfileTable
	.findFirst({
		with: { owner: true },
		where: eq(userProfileTable.userId, sql.placeholder("id")),
	})
	.prepare("select_user_profile");

const selectUserWithProfile = db.query.userTable
	.findFirst({
		columns: { githubId: false },
		with: { profile: true },
		where: eq(userTable.id, sql.placeholder("id")),
	})
	.prepare("select_user_with_profile");

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

async function selectUserChats(userId: string) {
	return await db.query.chatMemberTable
		.findMany({
			columns: {},
			where: (chatMemberTable, { eq }) => eq(chatMemberTable.userId, userId),
			with: {
				chat: {},
			},
		})
		.then((rows) => rows.map(({ chat }) => chat));
}

export {
	// * User schemas
	insertUserSchema,
	selectUserSchema,
	selectUserProfileSchema,
	updateUserProfileSchema,
	userWithProfileSchema,
	// * User queries
	selectUserWithProfile,
	selectUserProfile,
	insertUserProfileSchema,
	// * User functions
	selectUserChats,
	updateUserProfile,
	insertUserWithProfile,
};
export type { User, UserProfile, UserWithProfile };
