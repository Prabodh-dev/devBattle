import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/lib/store'
interface ProtectedRouteProps {
  children: React.ReactNode
}
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, setLoading, login } = useAuthStore()
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      if (!isAuthenticated) {
        try {
          const parsedUser = JSON.parse(storedUser)
          login(parsedUser, token)
        } catch (error) {
          console.error('Failed to parse stored user', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
        }
      }
      setLoading(false)
      return
    }
    setLoading(false)
    router.replace('/login')
  }, [isAuthenticated, login, router, setLoading])
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null
  }
  return <>{children}</>
}
