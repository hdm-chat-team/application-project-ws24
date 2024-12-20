import type { Env as HonoEnv } from "hono";
import type { User } from "#db/users";
import type { Session } from "#db/sessions";

export interface Env extends HonoEnv {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

/**
 * Represents a GitHub user as returned by the GitHub OAuth API
 * @see https://docs.github.com/rest/users/users#get-the-authenticated-user
 */
export type GitHubUser = {
	/** The unique identifier of the user */
	id: number;

	/** The username/handle of the user */
	login: string;

	/** The full name of the user (if provided) */
	name: string | null;

	/** The primary email of the user (if public) */
	email: string | null;

	/** URL to the user's GitHub avatar image */
	avatar_url: string;

	/** URL to the user's GitHub profile */
	html_url: string;

	/** The account type (usually "User") */
	type: string;

	/** ISO 8601 timestamp of when the account was created */
	created_at: string;

	/** ISO 8601 timestamp of when the account was last updated */
	updated_at: string;

	/** The location of the user set in GitHub */
	location: string | null;
};
