import { db } from "@/features/db";
import { queryOptions } from "@tanstack/react-query";

// Fetch all messages
export const messagesQuery = queryOptions({
	queryKey: ["db/messages/all"],
	queryFn: async () => {
		console.log(db.messages.name.toString());
		return await db.messages.toArray();
	},
});
