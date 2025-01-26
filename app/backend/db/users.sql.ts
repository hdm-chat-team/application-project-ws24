import {relations} from "drizzle-orm";
import {index, pgTable, primaryKey, varchar} from "drizzle-orm/pg-core";
import {sessionTable} from "#db/sessions.sql";
import {chatMemberTable} from "./chats.sql";
import {messageTable} from "./messages.sql";
import {id, ID_SIZE_CONFIG, timestamps} from "./utils";

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

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable),
	sessions: many(sessionTable),
	chats: many(chatMemberTable),
	messages: many(messageTable),
	contacts: many(contactsTable),
}));

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

export const contactsTable = pgTable(
	"contacts",
	{	id,
		userId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		contactId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		{
			pk: primaryKey({ columns: [table.userId, table.contactId] }),
		},
	],
);
