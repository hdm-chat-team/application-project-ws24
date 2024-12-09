import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "./auth-context";
import api from "@/lib/api";
import type { User } from "@server/db/schema.sql";
import { useEffect } from "react";
import { MessageService } from "./message-service";

// * Loading the user data and initializing the message service

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { data: user } = useQuery({
		queryKey: ["auth-user"],
		queryFn: async () => {
			const response = await api.auth.me.$get();
			if (!response.ok) return null;
			return response.json() as Promise<User>;
		},
	});

	useEffect(() => {
		if (user) {
			MessageService.getInstance().setCurrentUser(user);
		}
	}, [user]);

	return (
		<AuthContext.Provider value={user || null}>
			{children}
		</AuthContext.Provider>
	);
}