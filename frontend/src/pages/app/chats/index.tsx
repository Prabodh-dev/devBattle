import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import ChatList from '@/components/chat/ChatList'
import ChatWindow from '@/components/chat/ChatWindow'
import { useAuthStore, useChatStore } from '@/lib/store'
import { chatAPI } from '@/lib/api'
import socketService from '@/lib/socket'
export default function ChatsPage() {
  const router = useRouter()
  const { chatId } = router.query
  const { user } = useAuthStore()
  const { chats, messages, isTyping, setChats, setMessages, addMessage, setTyping, markAsRead } = useChatStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all')
  useEffect(() => {
    loadChats()
  }, [])
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId as string)
      markChatAsRead(chatId as string)
    }
  }, [chatId])
  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) return
    socket.on('message:new', (message: any) => {
      addMessage(message)
      if (message.chat === chatId) {
        chatAPI.markAsRead(chatId as string).catch(console.error)
      }
    })
    socket.on('user:typing', ({ userId, chatId: typingChatId }: any) => {
      if (typingChatId === chatId) {
        setTyping(userId, true)
        setTimeout(() => setTyping(userId, false), 3000)
      }
    })
    socket.on('user:stop-typing', ({ userId, chatId: typingChatId }: any) => {
      if (typingChatId === chatId) {
        setTyping(userId, false)
      }
    })
    socket.on('message:read', ({ chatId: readChatId }: any) => {
      if (readChatId === chatId) {
        markAsRead(readChatId)
      }
    })
    return () => {
      socket.off('message:new')
      socket.off('user:typing')
      socket.off('user:stop-typing')
      socket.off('message:read')
    }
  }, [chatId, addMessage, setTyping, markAsRead])
  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await chatAPI.getChats()
      if (response.success) {
        setChats(response.data)
      } else {
        setError(response.message || 'Failed to load chats')
      }
    } catch (err: any) {
      console.error('Failed to load chats:', err)
      setError(err.response?.data?.message || 'Failed to load chats')
    } finally {
      setLoading(false)
    }
  }
  const loadMessages = async (chatId: string) => {
    try {
      const response = await chatAPI.getMessages(chatId)
      if (response.success) {
        setMessages(response.data)
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err)
    }
  }
  const markChatAsRead = async (chatId: string) => {
    try {
      await chatAPI.markAsRead(chatId)
      markAsRead(chatId)
    } catch (err: any) {
      console.error('Failed to mark chat as read:', err)
    }
  }
  const handleSendMessage = async (content: string, type: 'text' | 'code', codeLanguage?: string) => {
    if (!chatId) return
    try {
      const messageData: any = {
        content,
        type,
      }
      if (codeLanguage) {
        messageData.codeLanguage = codeLanguage
      }
      const response = await chatAPI.sendMessage(chatId as string, messageData)
      if (response.success) {
        const socket = socketService.getSocket()
        if (socket) {
          socket.emit('message:send', {
            chatId,
            message: response.data
          })
        }
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again.')
    }
  }
  const handleTyping = () => {
    if (!chatId) return
    const socket = socketService.getSocket()
    if (socket) {
      socket.emit('user:typing', { chatId })
    }
  }
  const handleStopTyping = () => {
    if (!chatId) return
    const socket = socketService.getSocket()
    if (socket) {
      socket.emit('user:stop-typing', { chatId })
    }
  }
  const filteredChats = chats.filter(chat => {
    if (filter === 'unread') {
      return chat.unreadCount > 0
    }
    if (filter === 'groups') {
      return chat.participants.length > 2
    }
    return true
  })
  const selectedChat = chats.find(c => c._id === chatId)
  const otherUser = selectedChat?.participants.find(p => p._id !== user?._id)
  const currentUserTyping = otherUser ? isTyping[otherUser._id] : false
  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chats...</p>
          </div>
        </div>
      </AppLayout>
    )
  }
  if (error) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadChats}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }
  return (
    <AppLayout>
      <div className="flex h-full">
        {}
        <div className="w-80 border-r border-gray-800 bg-gray-950 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Chats</h1>
              <button className="p-2 rounded-lg hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 text-sm">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filter === 'all' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'unread' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Unread
              </button>
              <button 
                onClick={() => setFilter('groups')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === 'groups' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Groups
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {filteredChats.length > 0 ? (
              <ChatList chats={filteredChats as any} currentUserId={user?._id || ''} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 text-center">
                <p className="text-sm">No {filter !== 'all' ? filter : ''} chats found</p>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="flex-1">
          {chatId && selectedChat && otherUser ? (
            <ChatWindow
              chatId={chatId as string}
              otherUser={{
                _id: otherUser._id,
                username: otherUser.username,
                online: otherUser.online,
                lastSeen: '2 hours ago'
              }}
              messages={messages as any}
              currentUserId={user?._id || ''}
              onSendMessage={handleSendMessage}
              isTyping={currentUserTyping}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg className="w-24 h-24 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
              <p className="text-sm">Choose a conversation from the left panel to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
