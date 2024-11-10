import {
	deleteSessionById,
	insertSession,
	selectSessionById,
	updateSessionExpiresAt,
} from "@application-project-ws24/database/queries";
import type { Session } from "@application-project-ws24/database/schema";
import type { SessionValidationResult } from "./types";
import { hashToken } from "./utils";

// * Constants and initialization
const ONE_DAY = 1000 * 60 * 60 * 24;
const SESSION_DURATION = ONE_DAY * 30;
const REFRESH_THRESHOLD = ONE_DAY * 15;

export function generateSessionToken() {
	return Buffer.from(crypto.getRandomValues(new Uint8Array(20))).toString(
		"base64",
	);
}

// * Session management
export async function createSession(
	token: string,
	userId: string,
): Promise<Session> {
	const session = {
		id: hashToken(token),
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION),
	};
	await insertSession.execute(session);
	return session;
}

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const sessionId = hashToken(token);
	const session = await selectSessionById.execute({ sessionId });

	if (!session || Date.now() >= session.expiresAt.getTime()) {
		await deleteSessionById.execute({ sessionId });
		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - REFRESH_THRESHOLD) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
		await updateSessionExpiresAt.execute({
			sessionId,
			expiresAt: newExpiresAt,
		});
		session.expiresAt = newExpiresAt;
	}

	return { session, user: session.user };
}

export async function invalidateSession(sessionId: string) {
	await deleteSessionById.execute({ sessionId });
}
