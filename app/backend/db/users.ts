import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import type { GitHubUser } from "#auth/oauth";
import db from "#db";
import { chatMembershipTable } from "./chats.sql";
import type { DB, Transaction } from "./types";
import { userContactTable, userProfileTable, userTable } from "./users.sql";

const insertUserSchema = createInsertSchema(userTable, {
	id: cuidSchema,
	email: z.string().email(),
});

const selectUserSchema = createSelectSchema(userTable)
	// ? Are there any fields we should NOT be returning?
	.omit({
		githubId: true,
	});

type User = z.infer<typeof selectUserSchema>;

const insertUserProfileSchema = createInsertSchema(userProfileTable, {
	id: cuidSchema,
});

const updateUserProfileSchema = createUpdateSchema(userProfileTable, {
	displayName: z.string().nonempty(),
	avatarUrl: z.string().url(),
}).pick({
	displayName: true,
	avatarUrl: true,
});

const selectUserProfileSchema = createSelectSchema(userProfileTable);
type UserProfile = z.infer<typeof selectUserProfileSchema>;

const insertUserContactSchema = createInsertSchema(userContactTable).pick({
	contactId: true,
});
const selectUserContactSchema = createSelectSchema(userContactTable);
type UserContact = z.infer<typeof selectUserContactSchema>;

const insertUser = db
	.insert(userTable)
	.values({
		githubId: sql.placeholder("githubId"),
		username: sql.placeholder("username"),
		email: sql.placeholder("email"),
	})
	.returning({ id: userTable.id })
	.prepare("insert_user");

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
	.prepare("select_user_by_profile_username");

const selectUserById = db.query.userTable
	.findFirst({
		where: eq(userTable.id, sql.placeholder("id")),
	})
	.prepare("select_user_by_id");

const selectUserByEmail = db.query.userTable
	.findFirst({
		where: eq(userTable.email, sql.placeholder("email")),
	})
	.prepare("select_user_by_email");

const updateUserProfile = db
	.update(userProfileTable)
	.set({
		avatarUrl: sql.placeholder("avatarUrl").getSQL(),
		displayName: sql.placeholder("displayName").getSQL(),
	})
	.where(eq(userProfileTable.id, sql.placeholder("id")))
	.returning()
	.prepare("update_profile_avatar");

const selectUserChats = db.query.chatMembershipTable
	.findMany({
		columns: {},
		where: eq(chatMembershipTable.userId, sql.placeholder("id")),
		with: {
			chat: true,
		},
	})
	.prepare("select_user_chats");

const insertUserContact = db
	.insert(userContactTable)
	.values({
		contactorId: sql.placeholder("contactorId"),
		contactId: sql.placeholder("contactId"),
	})
	.returning()
	.prepare("insert_user_contact");

const selectUserContactsByUserId = db.query.userTable
	.findMany({
		columns: {
			id: true,
		},
		with: {
			contactOf: {
				columns: { contactId: true },
				where: eq(userContactTable.contactorId, sql.placeholder("userId")),
			},
		},
	})
	.prepare("select_user_contacts_by_user_id");

const deleteUserContact = db
	.delete(userContactTable)
	.where(
		and(
			eq(userContactTable.contactorId, sql.placeholder("contactorId")),
			eq(userContactTable.contactId, sql.placeholder("contactId")),
		),
	)
	.returning()
	.prepare("delete_user_contact");

export {
	// * User schemas
	insertUserSchema,
	selectUserSchema,
	selectUserProfileSchema,
	insertUserProfileSchema,
	updateUserProfileSchema,
	userWithProfileSchema,
	insertUserContactSchema,
	selectUserContactSchema,
	// * User queries
	selectUserById,
	selectUserDataByUsername,
	selectUserByEmail,
	insertUser,
	selectUserChats,
	updateUserProfile,
	insertUserContact,
	deleteUserContact,
	selectUserContactsByUserId,
	// * User functions
	insertUserWithProfile,
};
export type { User, UserProfile, UserWithProfile, UserContact };
