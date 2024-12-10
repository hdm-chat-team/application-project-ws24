import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthContext } from "./auth-context";

// * Loading the user data and initializing the message service

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
