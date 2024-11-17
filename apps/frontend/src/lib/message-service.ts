import Dexie from "dexie";
import type { EntityTable } from "dexie";

export interface Message {
	id?: string;
	content: string;
	timestamp: number;
	status: "sent" | "received";
}

const messageDb = new Dexie("MessageDatabase") as Dexie & {
	messages: EntityTable<Message, "id">;
};

messageDb.version(1).stores({
	messages: "++id, content, timestamp, type",
});

class MessageService {
	private static instance: MessageService;

	private constructor() {}

	public static getInstance() {
		if (!MessageService.instance) {
			MessageService.instance = new MessageService();
		}
		return MessageService.instance;
	}

	private async addMessageToDb(message: Message) {
		try {
			await messageDb.table("messages").add(message);
		} catch (error) {
			console.error("Error adding message to database", error);
		}
	}

	private createMessage(content: string, status: "sent" | "received"): Message {
		return {
			id: crypto.randomUUID(),
			content,
			status,
			timestamp: Date.now(),
		};
	}

	public async addMessage(message: Message) {
		await this.addMessageToDb(message);
	}

	public async addSentMessage(content: string) {
		const message = this.createMessage(content, "sent");
		await this.addMessage(message);
	}

	public async addReceivedMessage(content: string) {
		const message = this.createMessage(content, "received");
		await this.addMessage(message);
	}
}

export { messageDb, MessageService };
