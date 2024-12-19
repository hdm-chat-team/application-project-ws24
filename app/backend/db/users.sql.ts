import { relations } from "drizzle-orm";
import { sessionTable } from "./sessions.sql";
import { ID_SIZE_CONFIG, id, timestamps } from "./utils";

import { pgTable, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
	id,
	...timestamps,
	githubId: varchar({ length: 20 }).notNull().unique(),
	username: varchar({ length: 39 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable, {
		fields: [userTable.id],
		references: [userProfileTable.userId],
		relationName: "profile",
	}),
	sessions: many(sessionTable),
}));

export const userProfileTable = pgTable("user_profiles", {
	id,
	...timestamps,
	userId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
	displayName: varchar({ length: 255 }),
	avatar_url: varchar({ length: 255 }),
	html_url: varchar({ length: 255 }),
});

export const userProfileTableRelations = relations(
	userProfileTable,
	({ one }) => ({
		owner: one(userTable, {
			fields: [userProfileTable.userId],
			references: [userTable.id],
		}),
	}),
);
