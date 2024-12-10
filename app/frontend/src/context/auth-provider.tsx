import { authQueryOptions } from "@/lib/query-options";
import type { User } from "@server/db/schema.sql";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";

export const AuthContext = createContext<User | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { data: user } = useQuery(authQueryOptions);
	return (
		<AuthContext.Provider value={user || null}>{children}</AuthContext.Provider>
	);
}
