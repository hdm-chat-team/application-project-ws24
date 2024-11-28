import Dexie from "dexie";
import type { EntityTable } from "dexie";
import type { User } from '@server/db/schema.sql';

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

class MessageService {
	private static instance: MessageService;
	private currentUser: User | null = null;

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

	public setCurrentUser(user: User) {
        this.currentUser = user;
    }

	private createMessage(content: string, status: "sent" | "received"): Message {
		if (!this.currentUser) {
			throw new Error("Current user not set");
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
