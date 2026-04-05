import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import socketService from './socket'
interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  rating: number
  tier: string
  online?: boolean
  createdAt?: string
  bio?: string
  languages?: string[]
  stats?: Record<string, any>
}
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        socketService.connect(token)
        set({ user, token, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        socketService.disconnect()
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
interface Message {
  _id: string
  sender: User
  content: string
  type: string
  timestamp: Date
  read?: boolean
}
interface Chat {
  _id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: Date
}
interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isTyping: { [userId: string]: boolean }
  setChats: (chats: Chat[]) => void
  setCurrentChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  setTyping: (userId: string, isTyping: boolean) => void
  markAsRead: (chatId: string) => void
}
export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isTyping: {},
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, ...updates } : chat
      ),
    })),
  setTyping: (userId, isTyping) =>
    set((state) => ({
      isTyping: { ...state.isTyping, [userId]: isTyping },
    })),
  markAsRead: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    })),
}))
interface Battle {
  _id: string
  participants: User[]
  problem: any
  status: string
  winner?: User
  submissions: any[]
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}
interface BattleState {
  battles: Battle[]
  currentBattle: Battle | null
  setBattles: (battles: Battle[]) => void
  setCurrentBattle: (battle: Battle | null) => void
  updateBattle: (battleId: string, updates: Partial<Battle>) => void
  addSubmission: (battleId: string, submission: any) => void
}
export const useBattleStore = create<BattleState>((set) => ({
  battles: [],
  currentBattle: null,
  setBattles: (battles) => set({ battles }),
  setCurrentBattle: (battle) => set({ currentBattle: battle }),
  updateBattle: (battleId, updates) =>
    set((state) => ({
      battles: state.battles.map((battle) =>
        battle._id === battleId ? { ...battle, ...updates } : battle
      ),
      currentBattle:
        state.currentBattle?._id === battleId
          ? { ...state.currentBattle, ...updates }
          : state.currentBattle,
    })),
  addSubmission: (battleId, submission) =>
    set((state) => ({
      battles: state.battles.map((battle) =>
        battle._id === battleId
          ? { ...battle, submissions: [...battle.submissions, submission] }
          : battle
      ),
      currentBattle:
        state.currentBattle?._id === battleId
          ? {
              ...state.currentBattle,
              submissions: [...state.currentBattle.submissions, submission],
            }
          : state.currentBattle,
    })),
}))
interface Contest {
  _id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  problems: any[]
  participants: User[]
  status: string
}
interface ContestState {
  contests: Contest[]
  currentContest: Contest | null
  leaderboard: any[]
  setContests: (contests: Contest[]) => void
  setCurrentContest: (contest: Contest | null) => void
  setLeaderboard: (leaderboard: any[]) => void
  updateContest: (contestId: string, updates: Partial<Contest>) => void
}
export const useContestStore = create<ContestState>((set) => ({
  contests: [],
  currentContest: null,
  leaderboard: [],
  setContests: (contests) => set({ contests }),
  setCurrentContest: (contest) => set({ currentContest: contest }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  updateContest: (contestId, updates) =>
    set((state) => ({
      contests: state.contests.map((contest) =>
        contest._id === contestId ? { ...contest, ...updates } : contest
      ),
      currentContest:
        state.currentContest?._id === contestId
          ? { ...state.currentContest, ...updates }
          : state.currentContest,
    })),
}))
interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: Date
  relatedFriendRequest?: string
}
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
}
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
    })),
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== notificationId),
    })),
}))
interface UIState {
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      rightPanelOpen: true,
      theme: 'dark',
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleRightPanel: () =>
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)
