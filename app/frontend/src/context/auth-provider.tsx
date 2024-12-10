import api from "@/lib/api";
import type { User } from "@server/db/schema.sql";
import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode } from "react";

export const AuthContext = createContext<User | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { data: user } = useQuery({
		queryKey: ["auth-user"],
		queryFn: async () => {
			const response = await api.auth.user.$get();
			if (!response.ok) return null;
			const data = await response.json();
			return data.user;
		},
	});

	return (
		<AuthContext.Provider value={user || null}>{children}</AuthContext.Provider>
	);
}
