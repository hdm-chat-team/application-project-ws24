import type { User } from "@server/db/schema.sql";
import { createContext, useContext } from "react";

export const AuthContext = createContext<User | null>(null);

export function useAuthContext() {
	const user = useContext(AuthContext);
	return user;
}
