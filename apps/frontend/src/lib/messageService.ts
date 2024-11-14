import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import { useCallback } from 'react';

// * Define the message itself
interface Message {
    id?: number;
    content: string;
    timestamp: number;
    type: 'sent' | 'received';
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

// * Create a custom hook to encapsulate the access to the MessageService
export const useMessageService = () => {
    const messageService = MessageService.getInstance();

    
    const addMessage = useCallback(async (content: string) => {
        await messageService.addMessage(content);
    }, [messageService]);

    
    const addReceivedMessage = useCallback(async (content: string) => {
        await messageService.addReceivedMessage(content);
    }, [messageService]);

    return { addMessage, addReceivedMessage };
};

export { messageDb, MessageService };