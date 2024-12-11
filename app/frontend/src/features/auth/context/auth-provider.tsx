import { authQueryOptions } from "@/features/auth/queries";
import type { User } from "@server/db/schema.sql";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";

export const AuthContext = createContext<{
	user: User | null;
	isSignedIn: boolean;
	isLoaded: boolean;
	isLoading: boolean;
}>({ user: null, isSignedIn: false, isLoaded: false, isLoading: true });

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { data, isFetched, isLoading } = useQuery(authQueryOptions);
	return (
		<AuthContext.Provider
			value={{
				user: data ?? null,
				isSignedIn: !!data,
				isLoaded: isFetched,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
