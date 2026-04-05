import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { 
  TrophyIcon, 
  CodeBracketIcon, 
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/lib/store'
import { authAPI, userAPI } from '@/lib/api'
export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    languages: [] as string[]
  })
  useEffect(() => {
    loadProfileData()
  }, [])
  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError('')
      const [profileRes, statsRes] = await Promise.all([
        authAPI.getProfile(),
        userAPI.getUserStats(authUser?._id || '')
      ])
      if (profileRes.success && statsRes.success) {
        setStats(statsRes.data)
        setEditForm({
          username: profileRes.data.username || '',
          bio: profileRes.data.bio || '',
          languages: profileRes.data.languages || []
        })
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err)
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }
  const handleSaveProfile = async () => {
    try {
      const response = await authAPI.updateProfile(editForm)
      if (response.success) {
        updateUser(response.data)
        setIsEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      alert(err.response?.data?.message || 'Failed to update profile')
    }
  }
  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'text-gray-400',
      'Coder': 'text-green-400',
      'Expert': 'text-blue-400',
      'Master': 'text-purple-400',
      'Grandmaster': 'text-red-400'
    }
    return colors[rank] || 'text-gray-400'
  }
  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
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
              onClick={loadProfileData}
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
      <div className="h-full overflow-y-auto">
        {}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl">
                  {authUser?.avatar || authUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{authUser?.username}</h1>
                  <p className="text-gray-300 mb-3">{authUser?.email}</p>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full font-semibold ${getRankColor(authUser?.tier || 'Beginner')}`}>
                      {authUser?.tier || 'Beginner'}
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <TrophyIcon className="w-5 h-5" />
                      <span className="font-semibold">{authUser?.rating || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CalendarIcon className="w-5 h-5" />
                      <span>Joined {authUser?.createdAt ? formatJoinDate(authUser.createdAt as any) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg font-medium transition"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
            {authUser?.bio && (
              <p className="mt-6 text-gray-300 max-w-3xl">{authUser.bio}</p>
            )}
          </div>
        </div>
        {}
        <div className="max-w-6xl mx-auto p-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <CodeBracketIcon className="w-6 h-6 text-indigo-400" />
                <span className="text-sm text-gray-400">Problems Solved</span>
              </div>
              <div className="text-3xl font-bold">{stats?.problemsSolved || 0}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-sm text-gray-400">Battles Won</span>
              </div>
              <div className="text-3xl font-bold">{stats?.battlesWon || 0}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                <span className="text-sm text-gray-400">Contests</span>
              </div>
              <div className="text-3xl font-bold">{stats?.contestsParticipated || 0}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <FireIcon className="w-6 h-6 text-orange-400" />
                <span className="text-sm text-gray-400">Day Streak</span>
              </div>
              <div className="text-3xl font-bold">{stats?.currentStreak || 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {}
            <div className="col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {(authUser?.languages && authUser.languages.length > 0) ? (
                  authUser.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No languages added yet</p>
                )}
              </div>
            </div>
            {}
            <div className="col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'battle'
                          ? 'bg-red-900/30 text-red-400'
                          : activity.type === 'contest'
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-green-900/30 text-green-400'
                      }`}>
                        {activity.type === 'battle' ? (
                          <TrophyIcon className="w-4 h-4" />
                        ) : activity.type === 'contest' ? (
                          <ChartBarIcon className="w-4 h-4" />
                        ) : (
                          <CodeBracketIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveProfile()
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Languages</label>
                <input
                  type="text"
                  value={editForm.languages.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })}
                  placeholder="JavaScript, Python, Java"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
