import type { ServerWebSocket } from "bun";
import { z } from "zod";

// * Set of rules for the profile
// * Defines how the data should be validated
// * Set what are valid inputs and what fields are allowed

export type ChatSocket = ServerWebSocket<{ user: string }>;

export const GUIDParamSchema = z.object({
	id: z.string().uuid(),
});

//* Schema for profile editing
export const profileEditSchema = z.object({
	displayName: z
		.string()
		.min(1, "Name should be at least 1 character long")
		.max(20, "Name should be at most 20 characters long")
		.optional(),
	avatar_url: z.string().url("Please enter a valid URL").optional().nullable(),
});

export const profileResponseSchema = z.object({
	// * Profile Informations to display

	displayName: z.string().nullable(),
	avatar_url: z.string().nullable(),

	// * User Informations to display
	username: z.string(),
	email: z.string().email(),
});

export type ProfileEditData = z.infer<typeof profileEditSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
