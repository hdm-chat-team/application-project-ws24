import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { sessionTable } from "#db/sessions.sql";
import { chatMemberTable } from "./chats.sql";
import { messageTable } from "./messages.sql";
import { cuid, id, timestamps } from "./utils";

export const userTable = pgTable(
	"users",
	{
		id,
		...timestamps,
		githubId: varchar({ length: 20 }).notNull().unique(),
		username: varchar({ length: 39 }).notNull().unique(),
		email: varchar({ length: 255 }).notNull().unique(),
	},
	(table) => [
		{
			idIndex: index().on(table.id),
		},
	],
);

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable),
	sessions: many(sessionTable),
	chats: many(chatMemberTable),
	messages: many(messageTable),
	contactOf: many(contactsTable, {
		relationName: "user_contacting",
	}),
	contacts: many(contactsTable, {
		relationName: "user_contacted",
	}),
}));

export const userProfileTable = pgTable(
	"user_profiles",
	{
		id,
		...timestamps,
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" })
			.unique(),
		displayName: varchar({ length: 255 }),
		avatarUrl: varchar({ length: 255 }),
		htmlUrl: varchar({ length: 255 }),
	},
	(table) => [
		{
			userIdIndex: index().on(table.userId),
		},
	],
);

export const userProfileTableRelations = relations(
	userProfileTable,
	({ one }) => ({
		owner: one(userTable, {
			fields: [userProfileTable.userId],
			references: [userTable.id],
		}),
	}),
);

export const contactsTable = pgTable(
	"user_contacts",
	{
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		contactId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.userId, table.contactId] })],
);

export const contactsTableRelations = relations(contactsTable, ({ one }) => ({
	user: one(userTable, {
		relationName: "user_contacting",
		fields: [contactsTable.userId],
		references: [userTable.id],
	}),
	contact: one(userTable, {
		relationName: "user_contacted",
		fields: [contactsTable.contactId],
		references: [userTable.id],
	}),
}));
