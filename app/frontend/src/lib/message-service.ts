import Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { User } from "@server/db/schema.sql";

export interface Message {
	id?: string;
	content: string;
	timestamp: number;
	status: "sent" | "received";
	userId: string;
	username: string;
}

const messageDb = new Dexie("MessageDatabase") as Dexie & {
	messages: EntityTable<Message, "id">;
};

messageDb.version(4).stores({
	messages: "++id, content, timestamp, status, userId, username",
});

// * MessageService singleton for managing messages
class MessageService {
	private static instance: MessageService;
	private currentUser: User | null = null;
	private constructor() {
		console.log("MessageService instance created");
	}

	public static getInstance() {
		if (!MessageService.instance) {
			MessageService.instance = new MessageService();
		}
		return MessageService.instance;
	}

	public setCurrentUser(user: User | null) {
		this.currentUser = user;
	}
	private createMessage(content: string, status: "sent" | "received"): Message {
		if (!this.currentUser) {
			throw new Error("Please login to send messages.");
		}

		return {
			id: crypto.randomUUID(),
			content,
			status,
			timestamp: Date.now(),
			userId: this.currentUser.id,
			username: this.currentUser.username,
		};
	}

	public async addSentMessage(content: string): Promise<void> {
		if (!this.currentUser) {
			throw new Error("Login to send messages.");
		}
		await this.addMessageWithStatus(content, "sent");
	}

	public async addReceivedMessage(content: string) {
		if (!this.currentUser) {
			throw new Error("MessageService must be initialized before use");
		}
		await this.addMessageWithStatus(content, "received");
	}

	private async addMessageWithStatus(
		content: string,
		status: "sent" | "received",
	): Promise<void> {
		const message = this.createMessage(content, status);
		await this.addMessage(message);
	}

	private async addMessage(message: Message) {
		try {
			await messageDb.table("messages").add(message);
		} catch (error) {
			console.error("Error adding message to database:", error);
			throw new Error("Error adding message to database");
		}
	}
}

export { messageDb, MessageService };
