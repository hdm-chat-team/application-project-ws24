import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { sessionTable } from "./sessions.sql";

const insertSessionSchema = createInsertSchema(sessionTable);
const selectSessionSchema = createSelectSchema(sessionTable);
type Session = z.infer<typeof selectSessionSchema>;

const insertSession = db
	.insert(sessionTable)
	.values({
		token: sql.placeholder("token"),
		userId: sql.placeholder("userId"),
		deviceId: sql.placeholder("deviceId"),
	})
	.returning()
	.prepare("insert_session");

const selectSessionByToken = db.query.sessionTable
	.findFirst({
		where: eq(sessionTable.token, sql.placeholder("token")),
		with: { user: { columns: { githubId: false }, with: { profile: true } } },
	})
	.prepare("select_session_by_token");

const deleteSessionByToken = db
	.delete(sessionTable)
	.where(eq(sessionTable.token, sql.placeholder("token")))
	.prepare("delete_session_by_token");

const updateSessionExpiresAt = db
	.update(sessionTable)
	.set({
		expiresAt: sql`now() + interval '30 days'`,
	})
	.where(eq(sessionTable.token, sql.placeholder("token")))
	.returning({ newExpiresAt: sessionTable.expiresAt })
	.prepare("update_session_expires_at");

export {
	// * Session schemas
	insertSessionSchema,
	selectSessionByToken,
	selectSessionSchema,
	updateSessionExpiresAt,
	// * Session queries
	insertSession,
	deleteSessionByToken,
};
export type { Session };
