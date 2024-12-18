import { createId, length } from "@application-project-ws24/cuid";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// * User
export const userTable = pgTable("users", {
	id: varchar({ length }).primaryKey().$defaultFn(createId),
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
	id: varchar({ length }).primaryKey().$defaultFn(createId),
	userId: varchar({ length })
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

export const insertUserProfileSchema = createInsertSchema(userProfileTable);
export const selectUserProfileSchema = createSelectSchema(userProfileTable);
export type UserProfile = z.infer<typeof selectUserProfileSchema>;

// * Session
export const sessionTable = pgTable("sessions", {
	token: varchar({ length: 64 }).primaryKey(),
	userId: varchar({ length })
		.notNull()
		.references(() => userTable.id),
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

export const insertSessionSchema = createInsertSchema(sessionTable);
export const selectSessionSchema = createSelectSchema(sessionTable);
export type Session = z.infer<typeof selectSessionSchema>;
