import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// * User
export const userTable = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	githubId: varchar({ length: 20 }).notNull().unique(),
	username: varchar({ length: 39 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	sessions: many(sessionTable),
	profile: one(userProfileTable, {
		fields: [userTable.id],
		references: [userProfileTable.userId],
		relationName: "profile",
	}),
}));

export const insertUserSchema = createInsertSchema(userTable, {
	email: z.string().email().min(1),
});
export const selectUserSchema = createSelectSchema(userTable, {
	email: z.string().email().min(1),
});
export type User = z.infer<typeof selectUserSchema>;

export const userProfileTable = pgTable("user_profiles", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid()
		.references(() => userTable.id, { onDelete: "cascade" })
		.notNull(),
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

export const insertUserProfileSchema = createInsertSchema(userProfileTable);
export const selectUserProfileSchema = createSelectSchema(userProfileTable);
export type UserProfile = z.infer<typeof selectUserProfileSchema>;

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

export const profileResponseSchema = z.object({
	// * Profile Informations to display

	displayName: z.string().nullable(),
	avatar_url: z.string().nullable(),

	// * User Informations to display
	username: z.string(),
	email: z.string().email(),
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export const insertSessionSchema = createInsertSchema(sessionTable);
export const selectSessionSchema = createSelectSchema(sessionTable);
export type Session = z.infer<typeof selectSessionSchema>;
