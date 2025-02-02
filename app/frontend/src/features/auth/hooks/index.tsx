import { useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { authQueryOptions } from "../queries";

/**
 * A custom hook that provides access to the authenticated user's data and authentication status.
 * Must be used within an AuthProvider component context.
 *
 * @returns An object containing:
 * - user: The authenticated user's data or null
 * - isSignedIn: A boolean indicating if the user is authenticated
 * - Additional properties from the auth context's query
 *
 * @throws {Error} If used outside of an AuthProvider context
 */
export function useUser() {
	const { data, ...rest } = useQuery(authQueryOptions);
	if (!data) throw redirect({ to: "/signin", search: { from: location.href } });
	const { user, profile } = data;

	return { user, profile, ...rest };
}
