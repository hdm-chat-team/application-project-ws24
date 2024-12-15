import { z } from "zod";
import { profileResponseSchema, type ProfileResponse } from "../../db/schema.sql";

export { profileResponseSchema, type ProfileResponse };	

// * Set of rules for the profile
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

export type ProfileEditData = z.infer<typeof profileEditSchema>;