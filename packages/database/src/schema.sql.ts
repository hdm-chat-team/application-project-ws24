import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const defaults = {
	id: uuid().primaryKey().defaultRandom(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp(),
};

// * User
export const userTable = pgTable("users", {
	...defaults,
	email: varchar({ length: 255 }).notNull().unique(),
	username: varchar({ length: 20 }).notNull().unique(),
	passwordHash: varchar({ length: 255 }).notNull(),
});

export const userTableRelations = relations(userTable, ({ one }) => ({
	profile: one(userProfileTable, {
		fields: [userTable.id],
		references: [userProfileTable.userId],
		relationName: "profile",
	}),
}));

export type User = InferSelectModel<typeof userTable>;

export const userProfileTable = pgTable("user_profiles", {
	...defaults,
	userId: uuid()
		.references(() => userTable.id, { onDelete: "cascade" })
		.notNull(),
	displayName: varchar({ length: 50 }).notNull(),
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

// * Session
export const sessionTable = pgTable("sessions", {
	id: varchar({ length: 64 }).primaryKey(),
	userId: uuid()
		.references(() => userTable.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at", {
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
