import { relations } from "drizzle-orm";
import { sessionTable } from "./sessions.sql";
import { ID_SIZE_CONFIG, id, timestamps } from "./utils";

import { index, pgTable, varchar } from "drizzle-orm/pg-core";
import { chatMemberTable } from "./chats.sql";
import { messageTable } from "./messages.sql";

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
