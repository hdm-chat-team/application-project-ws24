import { lazy,useState, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import MessageInput from '../components/message-input'
import { messageDb, useMessageService } from '../lib/message-service'
import type { Message } from '../lib/message-service'

// * Define the route for the test page
export const Route = createLazyFileRoute('/test-page')({
  component: lazy(() => import('./test-page.lazy')),
});

// * Test page to test the local database
const TestPage = () => {
  const [receivedMessage, setReceivedMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const { addReceivedMessage } = useMessageService()

  // * Fetch all messages from the local database
  useEffect(() => {
    const fetchMessages = async () => {
      const allMessages: Message[] = await messageDb.messages.toArray()
      setMessages(allMessages)
    }
    fetchMessages()
  }, [])

  // * Handle the received message input
  const handleReceiveMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceivedMessage(e.target.value)
  }

  // * Handle the save message button click
  const handleSaveMessage = async () => {
    if (receivedMessage.trim() === '') {
      alert('Nachricht darf nicht leer sein')
      return
    }
    await addReceivedMessage(receivedMessage)
    setReceivedMessage('')
    const allMessages: Message[] = await messageDb.messages.toArray()
    setMessages(allMessages)
  }

  // * Render the test page
  return (
    <div>
      <h1>Test Page for local db tests</h1>
      <MessageInput />
      <input
        type="text"
        value={receivedMessage}
        onChange={handleReceiveMessage}
        placeholder="Empfangene Nachricht eingeben"
      />
      <button type="button" onClick={handleSaveMessage}>
        Nachricht speichern
      </button>
      <ul>
        {messages.map((msg: Message) => (
          <li key={msg.id}>
            {msg.content} ({msg.type})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TestPage