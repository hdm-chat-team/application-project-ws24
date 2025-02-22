import { GitHub } from "arctic";
import env from "#env";

export const github = new GitHub(
	env.CLIENT_ID_GITHUB,
	env.CLIENT_SECRET_GITHUB,
	env.CALLBACK_URL_GITHUB,
);

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

/**
 * Represents a GitHub email address as returned by the GitHub OAuth API
 * @see https://docs.github.com/en/rest/users/emails#list-email-addresses-for-the-authenticated-user
 */
export type GitHubEmail = {
	/** The email address of the user */
	email: string;

	/** Whether this is the user's primary email address */
	primary: boolean;

	/** Whether this email address has been verified */
	verified: boolean;

	/** The visibility setting of the email address (public or private) */
	visibility: "public" | null;
};
