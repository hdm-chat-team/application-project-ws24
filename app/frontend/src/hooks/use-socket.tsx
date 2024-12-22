import { SocketContext } from "@/context/socket-provider";
import { useContext } from "react";

export function useSocket() {
	const context = useContext(SocketContext);

	if (context === undefined)
		throw new Error("useSocket must be used within a SocketProvider");

	return context;
}
