import { eq, sql } from "drizzle-orm";
import db from "./db";
import { sessionTable } from "./schema.sql";

export const insertSession = db
	.insert(sessionTable)
	.values({
		id: sql.placeholder("id"),
		userId: sql.placeholder("userId"),
		expiresAt: sql.placeholder("expiresAt"),
	})
	.prepare("insert_session");

export const selectSessionById = db.query.sessionTable
	.findFirst({
		where: eq(sessionTable.id, sql.placeholder("sessionId")),
		with: { user: true },
	})
	.prepare("select_session_by_id");

export const deleteSessionById = db
	.delete(sessionTable)
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare("delete_session_by_id");

export const updateSessionExpiresAt = db
	.update(sessionTable)
	.set({
		expiresAt: sql.placeholder("expiresAt") as unknown as Date,
	})
	.where(eq(sessionTable.id, sql.placeholder("sessionId")))
	.prepare("update_session_expires_at");
