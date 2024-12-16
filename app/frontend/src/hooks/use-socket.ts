import { SocketContext } from "@/context/socket-provider";
import { useContext } from "react";

export function useSocket() {
	const context = useContext(SocketContext);

	if (context === undefined)
		throw new Error("useConnection must be used within a SocketProvider");

	const { data: socket, ...rest } = context;

	if (socket) {
		socket.onopen = (event) => {
			console.log("socket opened", event);
		};
		socket.onclose = (event) => {
			console.log("socket closed", event);
		};
	}
	return { socket, ...rest };
}
