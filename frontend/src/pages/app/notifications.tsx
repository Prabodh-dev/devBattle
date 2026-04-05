import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import {
  BellIcon,
  TrophyIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  FlagIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { notificationAPI, battleAPI, userAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useNotificationStore } from '@/lib/store'
interface Notification {
  _id: string
  type: 'battle_challenge' | 'friend_request' | 'message' | 'contest' | 'battle_result'
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: Date
}
export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, setNotifications, markAsRead: markStoreAsRead, removeNotification } = useNotificationStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  useEffect(() => {
    loadNotifications()
  }, [])
  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await notificationAPI.getNotifications()
      if (response.success) {
        setNotifications(response.data)
      } else {
        setError(response.message || 'Failed to load notifications')
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err)
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      markStoreAsRead(notificationId)
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all')
      await notificationAPI.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (err: any) {
      console.error('Failed to mark all as read:', err)
      alert('Failed to mark all as read')
    } finally {
      setActionLoading(null)
    }
  }
  const handleAccept = async (notification: Notification) => {
    try {
      setActionLoading(notification._id)
      if (notification.type === 'battle_challenge') {
        const response = await battleAPI.acceptBattle(notification.data.battleId)
        if (response.success) {
          toast.success('Battle accepted. Redirecting...')
          router.push(`/app/battles/${notification.data.battleId}`)
        }
      } else if (notification.type === 'friend_request') {
        const response = await userAPI.respondToFriendRequest(notification.data.requestId, 'accept')
        if (response.success) {
          toast.success('Friend request accepted')
          window.dispatchEvent(new Event('friends:update'))
        }
      }
      handleMarkAsRead(notification._id)
    } catch (err: any) {
      console.error('Failed to accept:', err)
      alert(err.response?.data?.message || 'Failed to accept')
    } finally {
      setActionLoading(null)
    }
  }
  const handleDecline = async (notification: Notification) => {
    try {
      setActionLoading(notification._id)
      if (notification.type === 'battle_challenge') {
        const response = await battleAPI.declineBattle(notification.data.battleId)
        if (response.success) {
          toast('Battle declined')
        }
      } else if (notification.type === 'friend_request') {
        const response = await userAPI.respondToFriendRequest(notification.data.requestId, 'decline')
        if (response.success) {
          toast('Request declined')
          window.dispatchEvent(new Event('friends:update'))
        }
      }
      handleMarkAsRead(notification._id)
      removeNotification(notification._id)
    } catch (err: any) {
      console.error('Failed to decline:', err)
      alert(err.response?.data?.message || 'Failed to decline')
    } finally {
      setActionLoading(null)
    }
  }
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id)
    }
    if (notification.type === 'message' && notification.data?.chatId) {
      router.push(`/app/chats?chatId=${notification.data.chatId}`)
    } else if (notification.type === 'battle_result' && notification.data?.battleId) {
      router.push(`/app/battles/${notification.data.battleId}`)
    } else if (notification.type === 'contest' && notification.data?.contestId) {
      router.push(`/app/contests/${notification.data.contestId}`)
    }
  }
  const formatTime = (date: Date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diff = now.getTime() - notifDate.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
    return notifDate.toLocaleDateString()
  }
  const getIcon = (type: string) => {
    switch (type) {
      case 'battle_challenge':
      case 'battle_result':
        return <TrophyIcon className="w-5 h-5 text-yellow-400" />
      case 'friend_request':
        return <UserPlusIcon className="w-5 h-5 text-blue-400" />
      case 'message':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-green-400" />
      case 'contest':
        return <FlagIcon className="w-5 h-5 text-purple-400" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-400" />
    }
  }
  const unreadCount = notifications.filter(n => !n.read).length
  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </AppLayout>
    )
  }
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        {}
        <div className="bg-gray-950 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === 'mark-all'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                {actionLoading === 'mark-all' ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>
        </div>
        {}
        <div className="max-w-4xl mx-auto p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <BellIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
               <p className="text-gray-400">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-xl p-5 border transition cursor-pointer ${
                    notification.read
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      : 'bg-indigo-900/20 border-indigo-700 hover:bg-indigo-900/30'
                  }`}
                  onClick={() => handleNotificationClick(notification as any)}
                >
                  <div className="flex items-start gap-4">
                    {}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.read ? 'bg-gray-900' : 'bg-gray-800'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 ml-2 mt-2"></div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                      {}
                      {(notification.type === 'battle_challenge' || notification.type === 'friend_request') && !notification.read && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAccept(notification as any)
                            }}
                            disabled={actionLoading === notification._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                          >
                            <CheckIcon className="w-4 h-4" />
                            {actionLoading === notification._id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDecline(notification as any)
                            }}
                            disabled={actionLoading === notification._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
