import { SocketContext } from "@/context/socket-provider";
import { useCallback, useContext, useEffect } from "react";
import { toast } from "sonner";

export function useSocket() {
	const context = useContext(SocketContext);

	if (context === undefined)
		throw new Error("useSocket must be used within a SocketProvider");

	const handleOpen = useCallback(async () => {
		toast.success("WebSocket connected");
	}, []);

	const handleError = useCallback(() => {
		toast.error("WebSocket error");
	}, []);

	const handleClose = useCallback(() => {
		toast.warning("🔌 WebSocket disconnected");
	}, []);

	useEffect(() => {
		addEventListener("open", handleOpen);
		addEventListener("error", handleError);
		addEventListener("close", handleClose);

		return () => {
			removeEventListener("open", handleOpen);
			removeEventListener("error", handleError);
			removeEventListener("close", handleClose);
		};
	}, [handleOpen, handleError, handleClose]);

	return context;
}
