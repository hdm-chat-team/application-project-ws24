import {relations} from "drizzle-orm";
import {id, ID_SIZE_CONFIG, timestamps} from "./utils";

import {index, pgTable, varchar} from "drizzle-orm/pg-core";
import {sessionTable} from "#db/sessions.sql";
import {chatMemberTable} from "#db/chats.sql";

export const userTable = pgTable(
	"users",
	{
		id,
		...timestamps,
		githubId: varchar({ length: 20 }).notNull().unique(),
		username: varchar({ length: 39 }).notNull().unique(),
		email: varchar({ length: 255 }).notNull().unique(),
		avatarUrl: varchar("avatar_url"),
	},
	(table) => [
		{
			idIndex: index().on(table.id),
		},
	],
);

export const userProfileTable = pgTable(
	"user_profiles",
	{
		id,
		...timestamps,
		userId: varchar(ID_SIZE_CONFIG)
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

export const contactsTable = pgTable("contacts", {
	id,
	userId: varchar(ID_SIZE_CONFIG).notNull().references(() => userTable.id, { onDelete: "cascade" }),
	contactId: varchar(ID_SIZE_CONFIG).notNull().references(() => userTable.id, { onDelete: "cascade" }),
});

export const contactsRelations = relations(userTable, ({ one }) => ({
	userId: one(userTable, {
		fields: [contactsTable.userId],
		references: [userTable.id],
	}),
	contactId: one(userTable, {
		fields: [contactsTable.contactId],
		references: [userTable.id],
	}),
}))

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable),
	sessions: many(sessionTable),
	chat: many(chatMemberTable),
	contacts: many(contactsTable),
}));
