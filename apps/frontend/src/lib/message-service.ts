import Dexie from "dexie";
import type { EntityTable } from "dexie";

// * Define the message itself
export interface Message {
    id?: string;
    content: string;
    timestamp: number;
    status: 'sent' | 'received';
}

// * Define the local database with the message table
const messageDb = new Dexie('MessageDatabase') as Dexie & {
    messages: EntityTable<Message, 'id'>
};

// * Define the version of the database and the table
messageDb.version(1).stores({
    messages: "++id, content, timestamp, type"
});

// * Singleton MessageService to interact with the local database
class MessageService {
    private static instance: MessageService;

    private constructor() {}

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    // * Helper function to add a message to the local database
    private async addMessageToDb(message: Message): Promise<void> {
        try {
            await messageDb.table('messages').add(message);
        } catch (error) {
            console.error('Error adding message to database', error);
        }
    }

    // * Create a message object
    private createMessage(content: string, status: 'sent' | 'received'): Message {
        return {
			id: crypto.randomUUID(),
            content,
            status,
            timestamp: Date.now()
        };
    }

    // * Add a message to the local database
    public async addMessage(message: Message): Promise<void> {
        await this.addMessageToDb(message);
    }

    // * Add a sent message to the local database
    public async addSentMessage(content: string): Promise<void> {
        const message = this.createMessage(content, 'sent');
        await this.addMessage(message);
    }

    // * Add a received message to the local database
    public async addReceivedMessage(content: string): Promise<void> {
        const message = this.createMessage(content, 'received');
        await this.addMessage(message);
    }
}

export { messageDb, MessageService };