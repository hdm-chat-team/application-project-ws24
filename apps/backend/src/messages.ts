import { Hono } from "hono";
import { z } from "zod";
import { messages } from "../../../packages/database/src/schema.sql";
import db from "../../../packages/database/src/db";

const app = new Hono();

// * Schema for a message
const messageSchema = z.object({
  userId: z.string().uuid(),
  text: z.string(),
});

// * Post-Route to create a message
app.post('/messages', async (c) => {
  const result = messageSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ error: result.error.errors }, 400);
  }
  const { text } = result.data;
  const userId = '123e4567-e89b-12d3-a456-426614174000'; // Just a dummy userId for now
  await db.insert(messages).values({ userId, text }).execute();
  return c.json({ message: 'Message created' });
});

// * Get-Route to get all messages
app.get('/messages', async (c) => {
  const allMessages = await db.select().from(messages).execute();
  return c.json(allMessages);
});

// * Test to check  if messages can be created
app.get('/test', async (c) => {
  const testMessage = { userId: '123e4567-e89b-12d3-a456-426614174000', text: 'Test' };
  try {
    await db.insert(messages).values(testMessage).execute();
    return c.json({ message: 'Test message inserted' });
  } catch (error) {
    return c.json({ error: 'Test failed' }, 500);
  }
});