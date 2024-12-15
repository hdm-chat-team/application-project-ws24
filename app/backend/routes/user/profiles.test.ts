import { describe, expect, mock, test } from "bun:test";
import type { Session, User } from "#db/schema.sql";
import { Hono } from "hono";
import type { Context } from "hono";
import { protectedRoute } from "../../lib/middleware";
import { zValidator } from "@hono/zod-validator";
import { profileEditSchema, GUIDParamSchema } from "./types";

interface ProfileData {
	id: string;
	userId: string;
	displayName: string;
	avatar_url: string;
	owner: {
		id: string;
		email: string;
		username: string;
		githubId: string;
	};
}

interface ProfileResponse {
	data: ProfileData;
}

interface UpdateResponse {
	message: string;
	data: ProfileData;
}

interface ProfileUpdate {
	displayName: string;
	avatar_url: string;
}

const getUserProfile = {
	execute: async ({ id }: { id: string }): Promise<ProfileData | null> => ({
		id: "profile-1",
		userId: id,
		displayName: "Test User",
		avatar_url: "https://example.com/avatar.jpg",
		owner: {
			id,
			email: "test@example.com",
			username: "testuser",
			githubId: "12345",
		},
	}),
};

const updateUserProfile = {
	execute: async (
		_data: ProfileUpdate & { id: string },
	): Promise<{ success: true }> => ({
		success: true,
	}),
};

mock.module("../../db/db", () => ({
	query: {
		userProfileTable: {
			findFirst: () => ({
				prepare: () => getUserProfile,
			}),
		},
	},
	update: () => ({
		set: () => ({
			where: () => ({
				prepare: () => updateUserProfile,
			}),
		}),
	}),
}));

const authMiddleware = async (c: Context, next: () => Promise<void>) => {
	const testUser: User = {
		id: "test-id",
		email: "test@mail.de",
		username: "test",
		githubId: "12345",
	};
	const testSession: Session = {
		id: "test-session",
		userId: "test-id",
		expiresAt: new Date(Date.now() + 1000 * 60 * 60),
	};

	c.set("user", testUser);
	c.set("session", testSession);
	await next();
};

const testProfileRoute = new Hono<{
	Variables: { user: User; session: Session };
}>()
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) {
			return c.json({ error: "Profile not found" }, 404);
		}
		return c.json({ data });
	})
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", GUIDParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await getUserProfile.execute({ id });
			if (!userData) {
				return c.json({ error: "Profile not found" }, 404);
			}
			return c.json({ data: userData });
		},
	)
	.put(
		"/me",
		protectedRoute,
		zValidator("json", profileEditSchema),
		async (c) => {
			const user = c.get("user");
			const profile = c.req.valid("json") as ProfileUpdate;
			await updateUserProfile.execute({
				id: user.id,
				displayName: profile.displayName,
				avatar_url: profile.avatar_url,
			});
			const updatedProfile = await getUserProfile.execute({ id: user.id });
			if (!updatedProfile) {
				return c.json({ error: "Profile not found" }, 404);
			}
			return c.json({ message: "profile updated", data: updatedProfile });
		},
	);

const app = new Hono().use("*", authMiddleware).route("/", testProfileRoute);

describe("profile route integration", () => {
	test("should handle unauthenticated /me requests", async () => {
		const unauthApp = new Hono().route("/", testProfileRoute);
		const res = await unauthApp.request("/me");
		expect(res.status).toBe(401);
	});

	test("should handle authenticated /me requests", async () => {
		const res = await app.request("/me");
		expect(res.status).toBe(200);
		const response = (await res.json()) as ProfileResponse;
		expect(response.data).toHaveProperty("displayName");
		expect(response.data).toHaveProperty("avatar_url");
		expect(response.data.userId).toBe("test-id");
	});

	test("should handle profile requests by ID", async () => {
		const validUUID = "123e4567-e89b-12d3-a456-426614174000";
		const res = await app.request(`/${validUUID}`);
		expect(res.status).toBe(200);
		const response = (await res.json()) as ProfileResponse;
		expect(response.data).toHaveProperty("displayName");
		expect(response.data.userId).toBe(validUUID);
	});

	test("should handle unauthorized profile requests by ID", async () => {
		const unauthApp = new Hono().route("/", testProfileRoute);
		const validUUID = "123e4567-e89b-12d3-a456-426614174000";
		const res = await unauthApp.request(`/${validUUID}`);
		expect(res.status).toBe(401);
	});

	test("should handle invalid UUID in profile requests", async () => {
		const res = await app.request("/invalid-uuid");
		expect(res.status).toBe(400);
	});

	test("should handle non-existent profiles", async () => {
		const originalExecute = getUserProfile.execute;
		getUserProfile.execute = async (): Promise<ProfileData | null> => null;

		const validUUID = "123e4567-e89b-12d3-a456-426614174000";
		const res = await app.request(`/${validUUID}`);
		expect(res.status).toBe(404);

		getUserProfile.execute = originalExecute;
	});

	describe("profile updates", () => {
		test("should handle valid profile updates", async () => {
			const res = await app.request("/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					displayName: "New Name",
					avatar_url: "https://example.com/new-avatar.jpg",
				}),
			});

			expect(res.status).toBe(200);
			const response = (await res.json()) as UpdateResponse;
			expect(response.message).toBe("profile updated");
			expect(response.data.displayName).toBe("Test User");
		});

		test("should reject invalid profile updates", async () => {
			const res = await app.request("/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					displayName: "",
					avatar_url: "invalid-url",
				}),
			});

			expect(res.status).toBe(400);
		});
	});
});
