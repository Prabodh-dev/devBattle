import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Chat {
  _id: string
  participants: Array<{
    _id: string
    username: string
    avatar?: string
    online?: boolean
  }>
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      _id: string
      username: string
    }
  }
  unreadCount?: number
}

interface ChatListProps {
  chats: Chat[]
  currentUserId: string
}

export default function ChatList({ chats, currentUserId }: ChatListProps) {
  const router = useRouter()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p._id !== currentUserId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes < 1 ? 'Just now' : `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start a conversation with other developers</p>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
            Start Chat
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {chats.map((chat) => {
            const otherUser = getOtherParticipant(chat)
            if (!otherUser) return null

            return (
              <Link
                key={chat._id}
                href={`/app/chats/${chat._id}`}
                className={`block p-4 hover:bg-gray-800 transition cursor-pointer ${
                  selectedChatId === chat._id ? 'bg-gray-800' : ''
                }`}
                onClick={() => setSelectedChatId(chat._id)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold">
                      {otherUser.username[0].toUpperCase()}
                    </div>
                    {otherUser.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{otherUser.username}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage ? (
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage.sender._id === currentUserId ? 'You: ' : ''}
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No messages yet</p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
