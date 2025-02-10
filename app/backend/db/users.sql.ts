import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { sessionTable } from "#db/sessions.sql";
import { chatMembershipTable, chatTable } from "./chats.sql";
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
		uniqueIndex().on(table.id),
		uniqueIndex().on(table.username),
		uniqueIndex().on(table.email),
	],
);

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable),
	sessions: many(sessionTable),
	ownedChats: many(chatTable),
	chatMemberships: many(chatMembershipTable),
	messages: many(messageTable),
}));

export const userProfileTable = pgTable(
	"users_profiles",
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
		uniqueIndex().on(table.id),
		uniqueIndex().on(table.userId),
		index().on(table.displayName),
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
