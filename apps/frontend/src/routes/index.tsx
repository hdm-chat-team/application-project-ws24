import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function useWebSocket(url: number) {
  useEffect(() => {
    const socket = api.ws.$ws(url)

    socket.addEventListener('open', () => {
      socket.send('Hello from client!')
    })

    socket.addEventListener('message', (event) => {
      console.log('Message from server:', event.data)
    })

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
    })

    return () => {
      socket.close()
    }
  }, [url])
}

function Index() {
  useWebSocket(0)

  const { data, isPending } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  return (
    <h1 className="text-3xl text-blue-300">
      {isPending ? 'Loading...' : data}
    </h1>
  )
}

async function fetchData() {
  const response = await api.$get()
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.text()
}
