import {
	deleteSessionByToken,
	insertSession,
	selectSessionById,
	updateSessionExpiresAt,
} from "#db/queries";
import type { Session, User } from "#db/schema.sql";

const ONE_DAY = 1000 * 60 * 60 * 24;
const SESSION_DURATION = ONE_DAY * 30;
const REFRESH_THRESHOLD = ONE_DAY * 15;

function hashToken(token: string): string {
	const hasher = new Bun.CryptoHasher("sha256", Buffer.from("base64"));
	return hasher.update(token).digest("base64");
}

/**
 * Generates a cryptographically secure random session token.
 * @returns {string} A base64 encoded random token.
 */
export function generateSessionToken(): string {
	return Buffer.from(crypto.getRandomValues(new Uint8Array(20))).toString(
		"base64",
	);
}

/**
 * Creates a new session for a user.
 * @param {string} token - The session token generated for the user.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Session>} The created session object.
 */
export async function createSession(
	userId: string,
	token: string,
): Promise<Session> {
	const session = {
		token: hashToken(token),
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION),
	};
	await insertSession.execute(session).catch((error) => {
		console.error("Failed to insert session:", error);
		throw new Error("Failed to insert session");
	});
	return session;
}

type SessionValidationResult =
	| { session: Session; user: User; fresh: boolean }
	| { session: null; user: null; fresh: boolean };

/**
 * Validates a session token and refreshes the session if needed.
 * @param {string} token - The session token to validate.
 * @returns {Promise<SessionValidationResult>} Object containing the session and user if valid, null values if invalid.
 */
export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const sessionToken = hashToken(token);
	const session = await selectSessionById.execute({ token: sessionToken });
	let fresh = false;

	if (!session || Date.now() >= session.expiresAt.getTime()) {
		await deleteSessionByToken.execute({ token: sessionToken });
		return { session: null, user: null, fresh };
	}

	if (Date.now() >= session.expiresAt.getTime() - REFRESH_THRESHOLD) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
		await updateSessionExpiresAt.execute({
			token: sessionToken,
			expiresAt: newExpiresAt,
		});
		session.expiresAt = newExpiresAt;
		fresh = true;
	}

	const user = session.user;

	return {
		session,
		user,
		fresh,
	};
}

/**
 * Invalidates and removes a session.
 * @param {string} sessionToken - The ID of the session to invalidate.
 * @returns {Promise<void>}
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
	await deleteSessionByToken.execute({ token: sessionToken });
}
