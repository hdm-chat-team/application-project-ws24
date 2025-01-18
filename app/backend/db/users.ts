import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import type { GitHubUser } from "#auth/oauth";
import db from "#db";
import { contactsTable, userProfileTable, userTable } from "./users.sql";

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
		avatarUrl: sql.placeholder("avatarUrl"),
	})
	.returning({ id: userTable.id })
	.prepare("insert_user");

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
				avatarUrl: avatarUrl ?? "",
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

const selectUserByGithubId = db.query.userTable
	.findFirst({
		where: eq(userTable.githubId, sql.placeholder("githubId")),
	})
	.prepare("select_user_by_github_id");

const insertProfile = db
	.insert(userProfileTable)
	.values({
		userId: sql.placeholder("userId"),
		displayName: sql.placeholder("displayname"),
		avatarUrl: sql.placeholder("avatar_url"),
		htmlUrl: sql.placeholder("html_url"),
	})
	.returning({ id: userProfileTable.id });

const selectUserProfile = db.query.userProfileTable
	.findFirst({
		with: { owner: true },
		where: eq(userProfileTable.userId, sql.placeholder("id")),
	})
	.prepare("select_user_profile");

const selectUser = db.query.userTable
	.findFirst({
		where: eq(userTable.id, sql.placeholder("id")),
	})
	.prepare("select_user");

const selectUserContacts = async (userId: string) => {
	return db
		.select({
			id: userTable.id,
			avatarUrl: userTable.avatarUrl,
		})
		.from(userTable)
		.innerJoin(contactsTable, eq(contactsTable.contactId, userTable.id))
		.where(eq(contactsTable.userId, userId))
		.execute();
};

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
	selectUserByGithubId,
	selectUserProfileSchema,
	selectUserSchema,
	updateUserProfileSchema,
	// * User queries
	selectUserProfile,
	selectUser,
	insertProfile,
	insertUser,
	insertUserProfileSchema,
	// * User functions
	selectUserChats,
	updateUserProfile,
	insertUserWithProfile,
	selectUserContacts,
	contactsTable,
	userTable,
};
export type { User, UserProfile };
