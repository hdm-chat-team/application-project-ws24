import db from "@/lib/db";
import type {
	ClientToServerWsEventData,
	ServerToClientWsEventData,
} from "@shared/types";
import { localeTime } from "../message/utils";

export default async function handleMessage(
	data: ServerToClientWsEventData,
	sendMessage: (message: ClientToServerWsEventData) => void,
) {
	switch (data.type) {
		case "chat": {
			const chat = data.payload;
			await db.chats.put({ ...chat, syncState: "synced" });
			break;
		}
		case "message": {
			const message = data.payload;
			await db.messages.put({
				...message,
				receivedAt: localeTime(),
			});
			sendMessage({
				type: "message:received",
				payload: { id: message.id, authorId: message.authorId },
			});
			break;
		}
		case "message:attachment": {
			const attachment = data.payload;
			await db.messageAttachments.put(attachment);
			break;
		}
		case "message:state": {
			const { id, state } = data.payload;
			await db.messages.update(id, { state });
			break;
		}
		default:
			break;
	}
}
