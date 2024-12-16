import { AuthContext } from "@/features/auth/context/auth-provider";
import { useContext } from "react";

export function useUser() {
	const context = useContext(AuthContext);

	if (context === undefined)
		throw new Error("useUser must be used within an AuthProvider");

	const { data: user, ...rest } = context;
	return { user, ...rest };
}
