import { AuthContext } from "@/features/auth/context/auth-provider"; // Adjust the import path as necessary
import { useContext } from "react";

export function useAuth() {
	const user = useContext(AuthContext);
	return user;
}
