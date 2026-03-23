import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },
}

// Chat API
export const chatAPI = {
  getChats: async () => {
    const response = await api.get('/chats')
    return response.data
  },

  getChatById: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  },

  getMessages: async (chatId: string, page = 1, limit = 50) => {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit },
    })
    return response.data
  },

  sendMessage: async (chatId: string, data: { content: string; type?: string }) => {
    const response = await api.post(`/chats/${chatId}/messages`, data)
    return response.data
  },

  createChat: async (userId: string) => {
    const response = await api.post('/chats', { userId })
    return response.data
  },

  markAsRead: async (chatId: string) => {
    const response = await api.put(`/chats/${chatId}/read`)
    return response.data
  },
}

// Group API
export const groupAPI = {
  getGroups: async () => {
    const response = await api.get('/groups')
    return response.data
  },

  getGroupById: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}`)
    return response.data
  },

  createGroup: async (data: { name: string; description?: string; members: string[] }) => {
    const response = await api.post('/groups', data)
    return response.data
  },

  updateGroup: async (groupId: string, data: any) => {
    const response = await api.put(`/groups/${groupId}`, data)
    return response.data
  },

  addMember: async (groupId: string, userId: string) => {
    const response = await api.post(`/groups/${groupId}/members`, { userId })
    return response.data
  },

  removeMember: async (groupId: string, userId: string) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`)
    return response.data
  },

  leaveGroup: async (groupId: string) => {
    const response = await api.post(`/groups/${groupId}/leave`)
    return response.data
  },
}

// Battle API
export const battleAPI = {
  getBattles: async () => {
    const response = await api.get('/battles/my-battles')
    return response.data
  },

  getBattleById: async (battleId: string) => {
    const response = await api.get(`/battles/${battleId}`)
    return response.data
  },

  createBattle: async (data: { opponentId: string }) => {
    const response = await api.post('/battles/challenge', data)
    return response.data
  },

  acceptBattle: async (battleId: string) => {
    const response = await api.put(`/battles/${battleId}/accept`)
    return response.data
  },

  declineBattle: async (battleId: string) => {
    const response = await api.put(`/battles/${battleId}/decline`)
    return response.data
  },

  submitCode: async (battleId: string, data: { code: string; language: string }) => {
    const response = await api.post(`/battles/${battleId}/submit`, data)
    return response.data
  },

  getBattleSubmissions: async (battleId: string) => {
    const response = await api.get(`/battles/${battleId}/submissions`)
    return response.data
  },
}

// Contest API
export const contestAPI = {
  getContests: async (status?: string) => {
    const response = await api.get('/contests', { params: { status } })
    return response.data
  },

  getContestById: async (contestId: string) => {
    const response = await api.get(`/contests/${contestId}`)
    return response.data
  },

  registerContest: async (contestId: string) => {
    const response = await api.post(`/contests/${contestId}/register`)
    return response.data
  },

  getContestProblems: async (contestId: string) => {
    const response = await api.get(`/contests/${contestId}/problems`)
    return response.data
  },

  submitContestProblem: async (
    contestId: string,
    problemId: string,
    data: { code: string; language: string }
  ) => {
    const response = await api.post(`/contests/${contestId}/problems/${problemId}/submit`, data)
    return response.data
  },

  getContestLeaderboard: async (contestId: string) => {
    const response = await api.get(`/contests/${contestId}/leaderboard`)
    return response.data
  },

  getContestSubmissions: async (contestId: string) => {
    const response = await api.get(`/contests/${contestId}/submissions`)
    return response.data
  },
}

// Problem API
export const problemAPI = {
  getProblems: async (filters?: any) => {
    const response = await api.get('/problems', { params: filters })
    return response.data
  },

  getProblemById: async (problemId: string) => {
    const response = await api.get(`/problems/${problemId}`)
    return response.data
  },

  submitProblem: async (problemId: string, data: { code: string; language: string }) => {
    const response = await api.post(`/problems/${problemId}/submit`, data)
    return response.data
  },

  getProblemSubmissions: async (problemId: string) => {
    const response = await api.get(`/problems/${problemId}/submissions`)
    return response.data
  },
}

// User API
export const userAPI = {
  searchUsers: async (query: string) => {
    const response = await api.get('/users/search', { params: { q: query } })
    return response.data
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  getUserStats: async (userId: string) => {
    const response = await api.get(`/users/${userId}/stats`)
    return response.data
  },

  sendFriendRequest: async (userId: string) => {
    const response = await api.post('/friends/request', { recipientId: userId })
    return response.data
  },

  acceptFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/${userId}/accept-friend`)
    return response.data
  },

  rejectFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/${userId}/reject-friend`)
    return response.data
  },

  getFriends: async () => {
    const response = await api.get('/friends')
    return response.data
  },

  removeFriend: async (userId: string) => {
    const response = await api.delete(`/friends/${userId}`)
    return response.data
  },

  getFriendRequests: async () => {
    const response = await api.get('/friends')
    return response.data
  },

  respondToFriendRequest: async (requestId: string, action: 'accept' | 'decline') => {
    const response = await api.put(`/friends/request/${requestId}/respond`, { action })
    return response.data
  },

  cancelFriendRequest: async (requestId: string) => {
    const response = await api.delete(`/friends/request/${requestId}`)
    return response.data
  },
}

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get('/leaderboard', { params: { page, limit } })
    return response.data
  },

  getBattleLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get('/leaderboard/battles', { params: { page, limit } })
    return response.data
  },

  getContestLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get('/leaderboard/contests', { params: { page, limit } })
    return response.data
  },
}

// Notification API
export const notificationAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications')
    return response.data
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all')
    return response.data
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },
}

// Judge API (direct to judge service)
export const judgeAPI = {
  submitCode: async (data: { code: string; language: string; testCases: any[] }) => {
    const JUDGE_URL = process.env.NEXT_PUBLIC_JUDGE_URL || 'http://localhost:8000'
    const response = await axios.post(`${JUDGE_URL}/execute`, data)
    return response.data
  },
}

export default api
