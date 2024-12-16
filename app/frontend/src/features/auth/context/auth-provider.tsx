import { authQueryOptions } from "@/features/auth/queries";
import type { User } from "@server/db/schema.sql";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export const AuthContext = createContext<
	UseQueryResult<User | null, Error> | undefined
>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const query = useQuery(authQueryOptions);
	return <AuthContext.Provider value={query}>{children}</AuthContext.Provider>;
}
