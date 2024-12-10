import { useContext } from "react";
import { AuthContext } from "@/context/auth-provider"; // Adjust the import path as necessary

export function useAuth() {
	const user = useContext(AuthContext);
	return user;
}
