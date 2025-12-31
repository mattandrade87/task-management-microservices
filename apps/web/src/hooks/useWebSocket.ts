import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3004'

interface UseWebSocketOptions {
  onNotification?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket(token: string | null, options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      // Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      options.onConnect?.()
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      options.onDisconnect?.()
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    // Notification event
    socket.on('notification', (data) => {
      console.log('Received notification:', data)
      options.onNotification?.(data)
    })

    // Cleanup
    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [token])

  const markAsRead = (notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', { notificationId })
    }
  }

  return {
    isConnected,
    markAsRead,
    socket: socketRef.current,
  }
}
