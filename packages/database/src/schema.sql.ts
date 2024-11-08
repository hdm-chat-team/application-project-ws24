import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const defaults = {
	id: uuid().primaryKey().defaultRandom(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp(),
};

// * User
export const users = pgTable("users", {
	...defaults,
	email: varchar({ length: 255 }).notNull().unique(),
	username: varchar({ length: 20 }).notNull().unique(),
	passwordHash: varchar({ length: 255 }).notNull(),
});

export const userRelations = relations(users, ({ one }) => ({
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId],
		relationName: "profile",
	}),
}));

export const userProfiles = pgTable("user_profiles", {
	...defaults,
	userId: uuid()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	displayName: varchar({ length: 50 }).notNull(),
});

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
	owner: one(users, {
		fields: [userProfiles.userId],
		references: [users.id],
	}),
}));

// * Session
export const sessions = pgTable("sessions", {
	id: varchar({ length: 64 }).primaryKey(),
	userId: uuid()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});
