import db from "@/lib/db";
import type {
	ClientToServerWsEventData,
	ServerToClientWsEventData,
} from "@shared/types";
import { localeTime } from "../message/utils";
import { saveFile } from "../uploadthing/mutations";

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
			const { messageId, type } = data.payload;
			const message = await db.messages.get(messageId);
			if (!message?.attachmentId) return;

			const existingFile = await db.files.get(message.attachmentId);
			if (existingFile?.blob) return;

			const response = await fetch(`/api/files/${message.attachmentId}`);
			const blob = await response.blob();
			const file = new File([blob], message.attachmentId, { type });

			await saveFile(file, message.attachmentId);
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
