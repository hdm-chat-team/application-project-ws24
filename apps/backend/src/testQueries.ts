import db  from '../../../packages/database/src/db'; 
import { messages } from '../../../packages/database/src/schema.sql';


//* Function to insert a message
async function insertMessage(userId: string, text: string) {
    const newMessage = await db.insert(messages).values({
      userId,
      text
    });
    console.log('New Message:', newMessage);
  }
  
  // * Function to get all messages
  async function getAllMessages() {
    const allMessages = await db.select().from(messages);
    console.log('All messages:', allMessages);
  }
  
  // * Function to test the queries
  async function testQueries() {
    try {
      await insertMessage('123e4567-e89b-12d3-a456-426614174000', 'Test Message');
      await getAllMessages();
    } catch (error) {
      console.error('Failed', error);
    }
  }
  
  testQueries();