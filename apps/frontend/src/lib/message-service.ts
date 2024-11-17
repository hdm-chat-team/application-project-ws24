import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import { v4 as uuidv4 } from 'uuid';


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
    private async addMessageToDb(content: string, type: 'sent' | 'received'): Promise<void> {
        try {
            await messageDb.table('messages').add({
                id: uuidv4(),
                content,
                type,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error adding message to database', error);
        }
    }

    // * Add a sent message to the local database
    public async addMessage(content: string): Promise<void> {
        await this.addMessageToDb(content, 'sent');
    }

    // * Add a received message to the local database
    public async addReceivedMessage(content: string): Promise<void> {
        await this.addMessageToDb(content, 'received');
    }
}

export { messageDb, MessageService };