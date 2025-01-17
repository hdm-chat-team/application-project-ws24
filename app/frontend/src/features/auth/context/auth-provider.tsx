import { authQueryOptions } from "@/features/auth/queries";
import type { User, UserProfile } from "@server/db/users";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";

export const AuthContext = createContext<
	| UseQueryResult<
			{
				user: User;
				profile: UserProfile;
			} | null,
			Error
	  >
	| undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const query = useQuery(authQueryOptions);
	return <AuthContext.Provider value={query}>{children}</AuthContext.Provider>;
}
