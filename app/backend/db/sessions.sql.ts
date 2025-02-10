import { relations, sql } from "drizzle-orm";
import { index, uniqueIndex } from "drizzle-orm/pg-core";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./users.sql";
import { cuid } from "./utils";

// * Session
export const sessionTable = pgTable(
	"users_sessions",
	{
		token: varchar({ length: 64 }).primaryKey(),
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		expiresAt: timestamp({
			withTimezone: true,
		})
			.notNull()
			.$default(() => sql`now() + interval '30 days'`),
	},
	(table) => [uniqueIndex().on(table.token), index().on(table.userId)],
);

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));
