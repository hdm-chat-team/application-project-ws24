import { drizzle } from "drizzle-orm/node-postgres";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import * as pg from "pg";

import type { InferSelectModel } from "drizzle-orm";

const pool = new pg.Pool();
export const db = drizzle(pool);

export const userTable = pgTable("user", {
	id: serial("id").primaryKey(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
