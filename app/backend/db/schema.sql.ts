import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// * User
export const userTable = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	githubId: text().notNull().unique(),
	username: varchar({ length: 20 }).notNull().unique(),
});

export const userTableRelations = relations(userTable, ({ many }) => ({
	sessions: many(sessionTable),
}));

/* export const userTableRelations = relations(userTable, ({ one }) => ({
	profile: one(userProfileTable, {
		fields: [userTable.id],
		references: [userProfileTable.userId],
		relationName: "profile",
	}),
})); */

export type User = InferSelectModel<typeof userTable>;

/* export const userProfileTable = pgTable("user_profiles", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => userTable.id, { onDelete: "cascade" })
		.notNull(),
	displayName: varchar({ length: 50 }).notNull(),
});
 */
/* export const userProfileTableRelations = relations(
	userProfileTable,
	({ one }) => ({
		owner: one(userTable, {
			fields: [userProfileTable.userId],
			references: [userTable.id],
		}),
	}),
); */

// * Session
export const sessionTable = pgTable("sessions", {
	id: varchar({ length: 64 }).primaryKey(),
	userId: uuid()
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	expiresAt: timestamp({
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));

export type Session = InferSelectModel<typeof sessionTable>;