import { deleteSessionById, updateSessionExpiresAt } from "#db/queries.sql";
import { beforeAll, describe, expect, mock, spyOn, test } from "bun:test";
import * as sessionManager from "./session";

describe("session", () => {
	// Mock database queries
	mock.module("#db/queries.sql", () => ({
		deleteSessionById: { execute: mock(() => Promise.resolve()) },
		insertSession: { execute: mock(() => Promise.resolve()) },
		selectSessionById: { execute: mock(() => Promise.resolve()) },
		updateSessionExpiresAt: { execute: mock(() => Promise.resolve()) },
	}));

	beforeAll(() => {
		// Mock the console.error method
		spyOn(console, "error").mockImplementation((text: string, error: Error) => {
			console.info(text, error.toString());
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

			const session = await sessionManager.createSession(userId, token);

			expect(session).toHaveProperty("id");
			expect(session).toHaveProperty("userId", userId);
			expect(session.expiresAt instanceof Date).toBe(true);
		});

		test("handles database insertion error", async () => {
			const userId = "test-user-id";
			const token = "test-token";
			const dbError = new Error("Database error");

			mock.module("#db/queries.sql", () => ({
				insertSession: { execute: mock(() => Promise.reject(dbError)) },
			}));

			expect(sessionManager.createSession(userId, token)).rejects.toThrow(
				"Failed to insert session",
			);
		});
	});

	describe("validateSessionToken", () => {
		test("with valid token returns session and user", async () => {
			const mockSession = {
				id: "test-session-id",
				userId: "test-user-id",
				expiresAt: new Date(Date.now() + 1000 * 60 * 60),
				user: { id: "test-user-id", name: "Test User" },
			};

			mock.module("#db/queries.sql", () => ({
				selectSessionById: {
					execute: mock(() => Promise.resolve(mockSession)),
				},
			}));

			const result = await sessionManager.validateSessionToken("valid-token");
			expect(result.session).toBeTruthy();
			expect(result.user).toBeTruthy();
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
					execute: mock(() => Promise.resolve(mockExpiredSession)),
				},
			}));

			const result = await sessionManager.validateSessionToken("expired-token");
			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
		});

		test("refreshes near-expiry session", async () => {
			const nearExpiryTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
			const mockSession = {
				id: "test-session-id",
				userId: "test-user-id",
				expiresAt: nearExpiryTime,
				user: { id: "test-user-id", name: "Test User" },
			};

			mock.module("#db/queries.sql", () => ({
				selectSessionById: {
					execute: mock(() => Promise.resolve(mockSession)),
				},
			}));

			const result =
				await sessionManager.validateSessionToken("near-expiry-token");
			expect(result.fresh).toBe(true);
			expect(updateSessionExpiresAt.execute).toHaveBeenCalled();
		});
	});

	describe("invalidateSession", () => {
		test("deletes session", async () => {
			await sessionManager.invalidateSession("test-session-id");
			expect(deleteSessionById.execute).toHaveBeenCalled();
		});
	});
});
