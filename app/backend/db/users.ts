import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, or, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import db from "#db";
import { chatMembershipTable } from "./chats.sql";
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

const userWithProfileSchema = selectUserSchema.extend({
	profile: selectUserProfileSchema,
});
type UserWithProfile = z.infer<typeof userWithProfileSchema>;

const upsertUser = db
	.insert(userTable)
	.values({
		githubId: sql.placeholder("githubId"),
		username: sql.placeholder("username"),
		email: sql.placeholder("email"),
	})
	.onConflictDoUpdate({
		target: userTable.githubId,
		set: {
			username: sql.placeholder("username").getSQL(),
			email: sql.placeholder("email").getSQL(),
		},
	})
	.returning({ id: userTable.id })
	.prepare("upsert_user");

const upsertUserProfile = db
	.insert(userProfileTable)
	.values({
		userId: sql.placeholder("userId"),
		displayName: sql.placeholder("displayName"),
		avatarUrl: sql.placeholder("avatarUrl"),
		htmlUrl: sql.placeholder("htmlUrl"),
	})
	.onConflictDoUpdate({
		target: userProfileTable.userId,
		set: {
			displayName: sql.placeholder("displayName").getSQL(),
			avatarUrl: sql.placeholder("avatarUrl").getSQL(),
			htmlUrl: sql.placeholder("htmlUrl").getSQL(),
		},
	})
	.returning()
	.prepare("upsert_user_profile");

const selectUserByUsernameOrEmail = db.query.userTable
	.findMany({
		columns: { githubId: false },
		with: { profile: true },
		where: or(
			eq(userTable.username, sql.placeholder("search")),
			eq(userTable.email, sql.placeholder("search")),
		),
	})
	.prepare("select_user_by_username_or_email");

const selectUserDataByUsername = db.query.userTable
	.findFirst({
		with: { profile: true },
		where: eq(userTable.username, sql.placeholder("username")),
	})
	.prepare("select_user_by_profile_username");

const selectUserById = db.query.userTable
	.findFirst({
		columns: { githubId: false },
		with: { profile: true },
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

const selectChatsByMemberUserId = db.query.chatTable
	.findMany({
		with: {
			members: {
				where: eq(chatMembershipTable.userId, sql.placeholder("userId")),
			},
		},
	})
	.prepare("select_chats_by_member_user_id");

const insertUserContact = db
	.insert(userContactTable)
	.values({
		contactorId: sql.placeholder("contactorId"),
		contactId: sql.placeholder("contactId"),
	})
	.onConflictDoNothing()
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
	deleteUserContact,
	insertUserContact,
	insertUserContactSchema,
	insertUserProfileSchema,
	// * User schemas
	insertUserSchema,
	selectChatsByMemberUserId,
	selectUserByEmail,
	selectUserById,
	// * User queries
	selectUserByUsernameOrEmail,
	selectUserContactsByUserId,
	selectUserContactSchema,
	selectUserDataByUsername,
	selectUserProfileSchema,
	selectUserSchema,
	updateUserProfile,
	updateUserProfileSchema,
	upsertUser,
	upsertUserProfile,
	userWithProfileSchema,
};
export type { User, UserContact, UserProfile, UserWithProfile };
