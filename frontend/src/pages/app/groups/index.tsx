import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import { UsersIcon, PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { groupAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
interface Group {
  _id: string
  name: string
  description: string
  members: any[]
  avatar?: string
  unreadCount?: number
  lastActivity: string
  createdBy: string
}
export default function GroupsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'my-groups' | 'discover'>('my-groups')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public'
  })
  useEffect(() => {
    loadGroups()
  }, [])
  const loadGroups = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await groupAPI.getGroups()
      if (response.success) {
        setGroups(response.data)
      } else {
        setError(response.message || 'Failed to load groups')
      }
    } catch (err: any) {
      console.error('Failed to load groups:', err)
      setError(err.response?.data?.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a group name')
      return
    }
    try {
      setCreateLoading(true)
      const response = await groupAPI.createGroup({
        name: formData.name,
        description: formData.description,
        members: []
      })
      if (response.success) {
        setGroups([response.data, ...groups])
        setShowCreateModal(false)
        setFormData({ name: '', description: '', privacy: 'public' })
      } else {
        alert(response.message || 'Failed to create group')
      }
    } catch (err: any) {
      console.error('Failed to create group:', err)
      alert(err.response?.data?.message || 'Failed to create group. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }
  const handleOpenGroup = (groupId: string) => {
    router.push(`/app/groups/${groupId}`)
  }
  const formatLastActivity = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diff = now.getTime() - activityDate.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return activityDate.toLocaleDateString()
  }
  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading groups...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Groups</h1>
              <p className="text-gray-400 mt-1">Join developer communities and start collaborating</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
            >
              <PlusIcon className="w-5 h-5" />
              Create Group
            </button>
          </div>
          {}
          <div className="flex gap-4">
            <button 
              onClick={() => setTab('my-groups')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                tab === 'my-groups' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              My Groups
            </button>
            <button 
              onClick={() => setTab('discover')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                tab === 'discover' ? 'bg-indigo-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Discover
            </button>
          </div>
        </div>
        {}
        {error && (
          <div className="p-6">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
              {error}
              <button
                onClick={loadGroups}
                className="ml-4 text-sm underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        {}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => handleOpenGroup(group._id)}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    {group.name[0]}
                  </div>
                  {group.unreadCount && group.unreadCount > 0 ? (
                    <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                      {group.unreadCount}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-400 transition">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <UsersIcon className="w-4 h-4" />
                    <span>{group.members?.length || 0} members</span>
                  </div>
                  <span className="text-gray-500">{formatLastActivity(group.lastActivity)}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenGroup(group._id)
                  }}
                  className="w-full mt-4 py-2 bg-gray-900 hover:bg-indigo-600 rounded-lg text-sm font-medium transition"
                >
                  Open Chat
                </button>
              </div>
            ))}
          </div>
          {groups.length === 0 && !loading && !error && (
            <div className="text-center py-20">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
              <p className="text-gray-400 mb-6">Create or join a group to start collaborating</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>
      {}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., React Developers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="What's this group about?"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Privacy</label>
                <select 
                  value={formData.privacy}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="public">Public - Anyone can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', privacy: 'public' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
                >
                  {createLoading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
