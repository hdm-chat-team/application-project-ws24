import {
	deleteSessionByToken,
	insertSession,
	selectSessionByToken,
	updateSessionExpiresAt,
} from "#db/sessions";
import type { Session } from "#db/sessions";
import type { User, UserProfile } from "#db/users";

const ONE_DAY = 1000 * 60 * 60 * 24;
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
	deviceId: string,
): Promise<Session> {
	const [session] = await insertSession
		.execute({
			token: hashToken(token),
			userId,
			deviceId,
		})
		.catch((error) => {
			console.error("Failed to insert session:", error);
			throw new Error("Failed to insert session");
		});
	return session;
}

type SessionValidationResult =
	| { session: Session; user: User; profile: UserProfile; fresh: boolean }
	| { session: null; user: null; profile: null; fresh: boolean };

/**
 * Validates a session token and refreshes the session if needed.
 * @param {string} sessionToken - The session token to validate.
 * @returns {Promise<SessionValidationResult>} Object containing the session and user if valid, null values if invalid.
 */
export async function validateSessionToken(
	sessionToken: string,
): Promise<SessionValidationResult> {
	const token = hashToken(sessionToken);
	const result = await selectSessionByToken.execute({ token });
	let fresh = false;

	if (!result || Date.now() >= result.expiresAt.getTime()) {
		await deleteSessionByToken.execute({ token });
		return { session: null, user: null, profile: null, fresh };
	}

	if (Date.now() >= result.expiresAt.getTime() - REFRESH_THRESHOLD) {
		const { newExpiresAt } = await updateSessionExpiresAt
			.execute({
				token,
			})
			.then((rows) => rows[0]);
		result.expiresAt = newExpiresAt;
		fresh = true;
	}
	const { user: userWithProfile, ...session } = result;
	const { profile, ...user } = userWithProfile;

	return {
		session,
		user,
		profile: profile as UserProfile,
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
