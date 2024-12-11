import { z } from "zod";

export const callbackCookieSchema = z.object({
	github_oauth_state: z
		.string({
			required_error: "Invalid GitHub OAuth flow",
		})
		.min(1, "OAuth state cannot be empty"),
	oauth_redirect_to: z.string().default("/"),
});

export const callbackQuerySchema = z.object({
	code: z
		.string({
			required_error: "GitHub authorization code is required",
		})
		.min(1, "Authorization code cannot be empty"),
	state: z
		.string({
			required_error: "OAuth state is required",
		})
		.min(1, "OAuth state cannot be empty"),
});

export const githubQuerySchema = z.object({
	from: z.string().url().nullable(),
});
