import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import * as sessionManager from "./session";

function createMockQueries() {
	return {
		deleteSessionByToken: { execute: mock(() => Promise.resolve()) },
		insertSession: {
			execute: mock(() =>
				Promise.resolve([
					{
						token: "test-token",
						userId: "test-user-id",
						expiresAt: new Date(),
					},
				]),
			),
		},
		selectSessionByToken: {
			execute: mock(() =>
				Promise.resolve({
					token: "",
					userId: "",
					expiresAt: new Date(),
					user: { id: "", name: "" },
				}),
			),
		},
		updateSessionExpiresAt: {
			execute: mock(() =>
				Promise.resolve([
					{
						newExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
					},
				]),
			),
		},
	};
}

describe("session", () => {
	let mockQueries = createMockQueries();

	beforeEach(() => {
		mockQueries = createMockQueries();
		mock.module("#db/sessions", () => mockQueries);
	});

	beforeAll(() => {
		// Mock the console.error method
		spyOn(console, "error").mockImplementation((error) => {
			console.log("    Expected error:", "\x1b[31m%s\x1b[0m", error);
		});
	});

	describe("generateSessionToken", () => {
		test("returns a base64 string", () => {
			const token = sessionManager.generateSessionToken();
			expect(typeof token).toBe("string");
			expect(token).toBeTruthy();
			expect(() => Buffer.from(token, "base64")).not.toThrow();
		});
	});

	describe("createSession", () => {
		test("creates a valid session", async () => {
			const userId = "test-user-id";
			const token = "test-token";

			mockQueries.insertSession.execute = mock(() =>
				Promise.resolve([
					{
						token: "test-token",
						userId: "test-user-id",
						expiresAt: new Date(),
					},
				]),
			);
			const session = await sessionManager.createSession(userId, token);

			expect(session).toHaveProperty("token");
			expect(session).toHaveProperty("userId", userId);
			expect(session.expiresAt instanceof Date).toBe(true);
		});

		test("handles database insertion error", async () => {
			const userId = "test-user-id";
			const token = "test-token";
			const dbError = new Error("Database error");

			mockQueries.insertSession.execute = mock(() => Promise.reject(dbError));

			expect(sessionManager.createSession(userId, token)).rejects.toThrow(
				"Failed to insert session",
			);
		});
	});

	describe("validateSessionToken", () => {
		test("with valid token returns session and user", async () => {
			const mockSession = {
				token: "hashed-valid-token",
				userId: "test-user-id",
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // 20 days in future
				user: {
					id: "test-user-id",
					name: "test-user",
					githubId: "test-github-id",
					username: "test-user",
					email: "test@example.com",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			};

			mockQueries.selectSessionByToken.execute = mock(() => {
				return Promise.resolve(mockSession);
			});
			const result = await sessionManager.validateSessionToken("valid-token");

			const { user, ...sessionWithoutUser } = mockSession;
			expect(result.session).toEqual(sessionWithoutUser);
			expect(result.user).toEqual(mockSession.user);
			expect(result.fresh).toBe(false); // Should be false since expiry is far in future
		});

		test("with expired token returns null session and user", async () => {
			const mockExpiredSession = {
				id: "test-session-id",
				userId: "test-user-id",
				expiresAt: new Date(Date.now() - 1000),
				user: { id: "test-user-id", name: "Test User" },
			};

			mock.module("#db/queries.sql", () => ({
				selectSessionById: {
					execute: mock(({ token }) => {
						return token === "hashed-expired-token"
							? Promise.resolve(mockExpiredSession)
							: Promise.resolve(null);
					}),
				},
			}));

			const result = await sessionManager.validateSessionToken("expired-token");
			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
		});

		test("refreshes near-expiry session", async () => {
			const nearExpiryTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days
			const mockSession = {
				token: "hashed-near-expiry-token",
				userId: "test-user-id",
				expiresAt: nearExpiryTime,
				user: { id: "test-user-id", name: "Test User" },
			};

			mockQueries.selectSessionByToken.execute = mock(() => {
				return Promise.resolve(mockSession);
			});
			mockQueries.updateSessionExpiresAt.execute = mock(() =>
				Promise.resolve([
					{
						newExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
					},
				]),
			);

			const result =
				await sessionManager.validateSessionToken("near-expiry-token");
			expect(result.fresh).toBe(true);
			expect(mockQueries.updateSessionExpiresAt.execute).toHaveBeenCalled();
		});
	});

	describe("invalidateSession", () => {
		test("deletes session", async () => {
			mockQueries.deleteSessionByToken.execute = mock(() => Promise.resolve());
			await sessionManager.invalidateSession("test-session-id");
			expect(mockQueries.deleteSessionByToken.execute).toHaveBeenCalledWith({
				token: expect.any(String),
			});
		});
	});
});
