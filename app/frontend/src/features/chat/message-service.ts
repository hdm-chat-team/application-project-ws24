import { type Message, messageDb } from "@/features/db";

// * MessageService singleton for managing messages
class MessageService {
	private static instance: MessageService;
	private constructor() {
		console.log("MessageService instance created");
	}

	public static getInstance() {
		if (!MessageService.instance) {
			MessageService.instance = new MessageService();
		}
		return MessageService.instance;
	}

	private createMessage(content: string, userId: string): Message {
		return {
			id: crypto.randomUUID(),
			content,
			timestamp: Date.now(),
			userId,
		};
	}

	public async addSentMessage(content: string, userId: string): Promise<void> {
		const message = this.createMessage(content, userId);
		await this.addMessage(message);
	}

	public async addReceivedMessage(content: string, userId: string) {
		const message = this.createMessage(content, userId);
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
