import { create } from 'zustand'
interface User {
  id: string
  username: string
  email: string
  bio: string
  profilePicture: string
  rating: number
  rank: string
  stats: {
    wins: number
    losses: number
    problemsSolved: number
    totalBattles: number
  }
}
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
  updateUser: (updatedUser) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updatedUser } : null
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser))
      }
      return { user: newUser }
    })
  },
}))
