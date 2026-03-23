import { useState, useEffect, useRef } from 'react'
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  CodeBracketIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'

interface Message {
  _id: string
  sender: {
    _id: string
    username: string
    avatar?: string
  }
  content: string
  type: 'text' | 'code' | 'file'
  codeLanguage?: string
  createdAt: string
  read: boolean
  reactions?: Array<{
    emoji: string
    user: string
  }>
}

interface ChatWindowProps {
  chatId: string
  otherUser: {
    _id: string
    username: string
    avatar?: string
    online?: boolean
    lastSeen?: string
  }
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string, type: 'text' | 'code', codeLanguage?: string) => void
  isTyping?: boolean
}

export default function ChatWindow({ 
  chatId, 
  otherUser, 
  messages, 
  currentUserId, 
  onSendMessage,
  isTyping 
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('')
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText, showCodeEditor ? 'code' : 'text', showCodeEditor ? codeLanguage : undefined)
      setMessageText('')
      setShowCodeEditor(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold">
              {otherUser.username[0].toUpperCase()}
            </div>
            {otherUser.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{otherUser.username}</h2>
            <p className="text-xs text-gray-400">
              {otherUser.online ? 'Online' : `Last seen ${otherUser.lastSeen || 'recently'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-800 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800 transition">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender._id === currentUserId
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {!isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {message.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className={`max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <p className="text-xs text-gray-400 mb-1 ml-1">{message.sender.username}</p>
                    )}
                    
                    {message.type === 'code' ? (
                      <div className={`rounded-lg p-3 ${
                        isOwn ? 'bg-indigo-600' : 'bg-gray-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-300 font-mono">{message.codeLanguage}</span>
                          <CodeBracketIcon className="w-4 h-4" />
                        </div>
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className={`rounded-lg px-4 py-2 ${
                        isOwn 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1 ml-1">
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      {isOwn && (
                        <span className="text-xs text-gray-500">
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              )
            })}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {otherUser.username[0].toUpperCase()}
                </div>
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        {showCodeEditor && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-400">Code snippet:</span>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            <button
              onClick={() => setShowCodeEditor(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-lg hover:bg-gray-800 transition"
              title="Attach file"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className={`p-2 rounded-lg transition ${
                showCodeEditor ? 'bg-indigo-600' : 'hover:bg-gray-800'
              }`}
              title="Code snippet"
            >
              <CodeBracketIcon className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-gray-800 transition"
              title="Emoji"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
          </div>
          
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={showCodeEditor ? "Paste your code here..." : "Type a message..."}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-indigo-500 transition"
            rows={showCodeEditor ? 5 : 1}
            style={{ minHeight: showCodeEditor ? '120px' : '40px' }}
          />
          
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
