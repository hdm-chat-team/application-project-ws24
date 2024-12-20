import { describe, expect, mock, test } from "bun:test";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "#api/types";
import type { User, UserProfile } from "#db/users";
import { selectUserProfileSchema } from "#db/users";
import { protectedRoute } from "#lib/middleware";

const GUIDParamSchema = z.object({
	id: z
		.string()
		.min(1)
		.regex(/^[a-z0-9]+$/, "Invalid ID format"),
});

const profileEditSchema = selectUserProfileSchema
	.pick({
		displayName: true,
		avatar_url: true,
	})
	.extend({
		displayName: z.string().min(1, "Display name is required"),
		avatar_url: z.string().url("Invalid URL format"),
	})
	.required();

type ProfileWithOwner = UserProfile & { owner: User };
type ProfileResponse = { data: ProfileWithOwner };

const getUserProfile = {
	execute: async ({
		id,
	}: { id: string }): Promise<ProfileWithOwner | null> => ({
		id: "profile-1",
		userId: id,
		displayName: "Test User",
		avatar_url: "https://example.com/avatar.jpg",
		html_url: "https://example.com/profile",
		createdAt: new Date(),
		updatedAt: null,
		owner: {
			id,
			email: "test@example.com",
			username: "testuser",
			githubId: "12345",
			createdAt: new Date(),
			updatedAt: null,
		},
	}),
};

const updateUserProfile = {
	execute: async (_: z.infer<typeof profileEditSchema> & { id: string }) => ({
		success: true,
	}),
};

mock.module("#db", () => ({
	query: {
		userProfileTable: { findFirst: () => ({ prepare: () => getUserProfile }) },
	},
	update: () => ({
		set: () => ({ where: () => ({ prepare: () => updateUserProfile }) }),
	}),
}));

const authMiddleware = async (c: Context<Env>, next: () => Promise<void>) => {
	c.set("user", {
		id: "test-id",
		email: "test@mail.de",
		username: "test",
		githubId: "12345",
		createdAt: new Date(),
		updatedAt: null,
	});
	c.set("session", {
		token: "test-session",
		userId: "test-id",
		expiresAt: new Date(Date.now() + 1000 * 60 * 60),
	});
	await next();
};

const testProfileRoute = new Hono<Env>()
	.get("/me", protectedRoute, async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);
		const data = await getUserProfile.execute({ id: user.id });
		if (!data) return c.json({ error: "Profile not found" }, 404);
		return c.json({ data });
	})
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", GUIDParamSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const userData = await getUserProfile.execute({ id });
			if (!userData) return c.json({ error: "Profile not found" }, 404);
			return c.json({ data: userData });
		},
	)
	.put(
		"/me",
		protectedRoute,
		zValidator("json", profileEditSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) return c.json({ error: "Unauthorized" }, 401);
			const profile = c.req.valid("json");
			await updateUserProfile.execute({ id: user.id, ...profile });
			const updatedProfile = await getUserProfile.execute({ id: user.id });
			if (!updatedProfile) return c.json({ error: "Profile not found" }, 404);
			return c.json({ message: "profile updated", data: updatedProfile });
		},
	);

const app = new Hono<Env>()
	.use("*", authMiddleware)
	.route("/", testProfileRoute);

describe("profile route integration", () => {
	test("should handle unauthenticated /me requests", async () => {
		const res = await new Hono<Env>()
			.route("/", testProfileRoute)
			.request("/me");
		expect(res.status).toBe(401);
	});

	test("should handle authenticated /me requests", async () => {
		const res = await app.request("/me");
		expect(res.status).toBe(200);
		const response = (await res.json()) as ProfileResponse;
		expect(response.data.userId).toBe("test-id");
	});

	test("should handle profile requests by ID", async () => {
		const validId = "validcuid123";
		const res = await app.request(`/${validId}`);
		expect(res.status).toBe(200);
		const response = (await res.json()) as ProfileResponse;
		expect(response.data.userId).toBe(validId);
	});

	test("should handle invalid ID in profile requests", async () => {
		const res = await app.request("/invalid@id");
		expect(res.status).toBe(400);
	});

	describe("profile updates", () => {
		test("should handle valid profile updates", async () => {
			const res = await app.request("/me", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					displayName: "New Name",
					avatar_url: "https://example.com/new-avatar.jpg",
				}),
			});
			expect(res.status).toBe(200);
		});

		test("should reject invalid profile updates", async () => {
			const res = await app.request("/me", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					displayName: "",
					avatar_url: "invalid-url",
				}),
			});
			expect(res.status).toBe(400);
		});
	});
});
