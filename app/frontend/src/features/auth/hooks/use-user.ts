import { AuthContext } from "@/features/auth/context/auth-provider";
import { useContext } from "react";

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
	const context = useContext(AuthContext);

	if (context === undefined)
		throw new Error("useUser must be used within an AuthProvider");

	const { data: user, ...rest } = context;

	return { user: user || null, isSignedIn: !!user, ...rest };
}
