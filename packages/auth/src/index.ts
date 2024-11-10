import { GitHub } from "arctic";
import { eq } from "drizzle-orm";
import { type Session, type User, db, sessionTable, userTable } from "./db";

export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID,
	process.env.GITHUB_CLIENT_SECRET,
	null,
);

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = atob(bytes.toString());
	return token;
}
export async function createSession(
	token: string,
	userId: number,
): Promise<Session> {
	const sessionId = await Bun.password.hash(new TextEncoder().encode(token));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	await db.insert(sessionTable).values(session);
	return session;
}

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const sessionId = await Bun.password.hash(new TextEncoder().encode(token));
	const result = await db
		.select({ user: userTable, session: sessionTable })
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.where(eq(sessionTable.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessionTable)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(sessionTable.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
