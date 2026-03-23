import { useCallback, useEffect, useMemo, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  UserPlusIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

type Developer = {
  _id: string
  username: string
  rating?: number
  bio?: string
  avatar?: string
  languages?: string[]
}

type FriendRequest = {
  _id: string
  sender: Developer | string
  recipient: Developer | string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  createdAt?: string
}

type FriendNetworkResponse = {
  friends?: Developer[]
  accepted?: Developer[]
  pending?: {
    incoming?: FriendRequest[]
    outgoing?: FriendRequest[]
  }
  incoming?: FriendRequest[]
  outgoing?: FriendRequest[]
}

const getUserFromRequest = (request: FriendRequest, role: 'sender' | 'recipient'): Developer | null => {
  const value = request?.[role]
  if (!value) return null
  if (typeof value === 'string') {
    return {
      _id: value,
      username: 'Unknown Dev',
    }
  }
  return value
}

const getUserIdFromRequest = (request: FriendRequest, role: 'sender' | 'recipient') => {
  const value = request?.[role] as Developer | string | undefined
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id
}

const formatRelativeTime = (timestamp?: string) => {
  if (!timestamp) return 'Just now'
  const now = Date.now()
  const date = new Date(timestamp).getTime()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function FriendsPage() {
  const { user } = useAuthStore()
  const currentUserId = user?._id || ''
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Developer[]>([])
  const [searchError, setSearchError] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  const emitFriendUpdate = useCallback(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event('friends:update'))
  }, [])

  const {
    data: networkData,
    isPending: networkLoading,
    error: networkError,
  } = useQuery<FriendNetworkResponse, Error>({
    queryKey: ['friends', 'network'],
    queryFn: async () => {
    const response = await userAPI.getFriends()
    if (!response.success) throw new Error(response.message || 'Failed to load network')
    emitFriendUpdate()
    return (response.data as FriendNetworkResponse) || {}
    },
  })

  const friends: Developer[] = networkData?.friends || networkData?.accepted || []
  const incomingRequests: FriendRequest[] =
    networkData?.pending?.incoming || networkData?.incoming || []
  const outgoingRequests: FriendRequest[] =
    networkData?.pending?.outgoing || networkData?.outgoing || []

  const fetchDevelopers = useCallback(
    async (query = '') => {
      try {
        setSearchLoading(true)
        setSearchError('')
        const response = await userAPI.searchUsers(query)
        if (response.success) {
          const candidates: Developer[] = (response.data || []).filter((candidate: Developer) => candidate._id !== currentUserId)
          setSearchResults(candidates)
        } else {
          setSearchError(response.message || 'Unable to find developers')
          setSearchResults([])
        }
      } catch (err: any) {
        console.error('Failed to search developers', err)
        setSearchError(err.response?.data?.message || 'Unable to find developers')
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    [currentUserId]
  )

  useEffect(() => {
    if (!currentUserId) return
    fetchDevelopers('')
  }, [currentUserId, fetchDevelopers])
  const refetchNetwork = () => queryClient.invalidateQueries({ queryKey: ['friends', 'network'] })

  const sendRequestMutation = useMutation({
    mutationFn: (developerId: string) => userAPI.sendFriendRequest(developerId),
    onSuccess: () => {
      toast.success('Request sent')
      refetchNetwork()
    },
    onError: (err: any) => {
      console.error('Failed to send friend request', err)
      toast.error(err.response?.data?.message || 'Unable to send request')
    },
  })

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => userAPI.respondToFriendRequest(requestId, 'accept'),
    onSuccess: () => {
      toast.success('Connection established')
      refetchNetwork()
    },
    onError: (err: any) => {
      console.error('Failed to accept request', err)
      toast.error(err.response?.data?.message || 'Unable to accept request')
    },
  })

  const declineMutation = useMutation({
    mutationFn: ({ requestId, isIncoming }: { requestId: string; isIncoming: boolean }) =>
      isIncoming ? userAPI.respondToFriendRequest(requestId, 'decline') : userAPI.cancelFriendRequest(requestId),
    onSuccess: () => {
      toast.success('Request updated')
      refetchNetwork()
    },
    onError: (err: any) => {
      console.error('Failed to update request', err)
      toast.error(err.response?.data?.message || 'Unable to update request')
    },
  })

  const summaries = useMemo(() => {
    return [
      {
        label: 'Connections',
        value: friends.length,
        detail: 'Accepted developers',
        accent: 'from-indigo-500 via-purple-500 to-pink-500',
      },
      {
        label: 'Incoming Requests',
        value: incomingRequests.length,
        detail: 'Waiting on you',
        accent: 'from-emerald-500 via-lime-400 to-green-500',
      },
      {
        label: 'Outgoing Requests',
        value: outgoingRequests.length,
        detail: 'Pending approval',
        accent: 'from-amber-400 via-orange-500 to-red-500',
      },
    ]
  }, [friends.length, incomingRequests.length, outgoingRequests.length])

  const isFriend = (developerId: string) => friends.some((friend) => friend._id === developerId)
  const isIncoming = (developerId: string) =>
    incomingRequests.some((request) => getUserIdFromRequest(request, 'sender') === developerId)
  const isOutgoing = (developerId: string) =>
    outgoingRequests.some((request) => getUserIdFromRequest(request, 'recipient') === developerId)

  const renderDeveloperCard = (developer: Developer) => {
    const statusLabel = isFriend(developer._id)
      ? 'Connected'
      : isIncoming(developer._id)
      ? 'Requested you'
      : isOutgoing(developer._id)
      ? 'Pending'
      : null

    return (
      <div
        key={developer._id}
        className="p-5 bg-gray-800/80 border border-gray-700 rounded-2xl hover:border-indigo-500 transition"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold">{developer.username}</p>
            <p className="text-sm text-gray-400">Rating · {developer.rating ?? '—'}</p>
          </div>
          {statusLabel && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
              {statusLabel}
            </span>
          )}
        </div>
        {developer.bio && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{developer.bio}</p>}

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {(developer.languages || []).slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center justify-center text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-gray-900 border border-gray-700"
              >
                {lang}
              </span>
            ))}
          </div>
          {!isFriend(developer._id) && !isIncoming(developer._id) && (
            <button
              onClick={() => sendRequestMutation.mutate(developer._id)}
              disabled={isOutgoing(developer._id) || sendRequestMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:opacity-70 text-sm font-medium"
            >
              {sendRequestMutation.isPending ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlusIcon className="w-4 h-4" />
              )}
              {isOutgoing(developer._id) ? 'Requested' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="bg-gray-950 border-b border-gray-800 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs uppercase tracking-[0.3em] text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Network Mode
              </div>
              <h1 className="mt-4 text-3xl font-bold">Developer Network</h1>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Discover peers, send duel invites, and grow your squad. Incoming requests mirror the familiar social flow—feel like Instagram for devs, but with ELO on standby.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchDevelopers('')}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-900 transition"
              >
                Refresh Feed
              </button>
              <button
                onClick={() => document.getElementById('developer-search')?.focus()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium transition"
              >
                Find Developers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {summaries.map((summary) => (
              <div
                key={summary.label}
                className={`p-5 rounded-2xl border border-white/5 bg-gradient-to-br ${summary.accent} bg-opacity-10 text-white`}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">{summary.label}</p>
                <p className="text-4xl font-bold mt-2">{summary.value}</p>
                <p className="text-sm text-white/80">{summary.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {networkError && (
            <div className="px-4 py-3 bg-red-900/20 border border-red-700 text-red-200 rounded-lg">
              {networkError.message}
            </div>
          )}

          {/* Pending Requests */}
          <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserGroupIcon className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-semibold">Requests</h2>
                <p className="text-sm text-gray-400">Manage who joins your arena</p>
              </div>
            </div>

            {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <SparklesIcon className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                No pending connections. Send an invite to get started.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Incoming</p>
                  <div className="space-y-3">
                    {incomingRequests.length === 0 && <p className="text-sm text-gray-500">No new invites</p>}
                    {incomingRequests.map((request) => {
                      const sender = getUserFromRequest(request, 'sender')
                      if (!sender) return null
                      return (
                        <div key={request._id} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{sender.username}</p>
                              <p className="text-xs text-gray-400">{formatRelativeTime(request.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptMutation.mutate(request._id!)}
                                disabled={acceptMutation.isPending}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-medium flex items-center gap-1 disabled:opacity-70"
                              >
                                {acceptMutation.isPending ? (
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckIcon className="w-4 h-4" />
                                )}
                                Accept
                              </button>
                              <button
                                onClick={() => declineMutation.mutate({ requestId: request._id!, isIncoming: true })}
                                disabled={declineMutation.isPending}
                                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium flex items-center gap-1 disabled:opacity-70"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Outgoing</p>
                  <div className="space-y-3">
                    {outgoingRequests.length === 0 && <p className="text-sm text-gray-500">No pending invites</p>}
                    {outgoingRequests.map((request) => {
                      const target = getUserFromRequest(request, 'recipient')
                      if (!target) return null
                      return (
                        <div key={request._id} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{target.username}</p>
                              <p className="text-xs text-gray-400">{formatRelativeTime(request.createdAt)}</p>
                            </div>
                            <button
                              onClick={() => declineMutation.mutate({ requestId: request._id!, isIncoming: false })}
                              disabled={declineMutation.isPending}
                              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium flex items-center gap-1 disabled:opacity-70"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Connections */}
          <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-yellow-300" />
              <div>
                <h2 className="text-xl font-semibold">Your Squad</h2>
                <p className="text-sm text-gray-400">Trusted developers ready to battle</p>
              </div>
            </div>

            {networkLoading ? (
              <div className="py-16 text-center text-gray-400">
                <ArrowPathIcon className="w-6 h-6 mx-auto mb-3 animate-spin" />
                Loading network...
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No connections yet. Send a request from the discover panel below.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {friends.map((friend) => (
                  <div key={friend._id} className="p-5 bg-gray-800/70 border border-gray-700 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">{friend.username}</p>
                        <p className="text-sm text-gray-400">Rating · {friend.rating ?? '—'}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Connected
                      </span>
                    </div>
                    {friend.bio && <p className="text-sm text-gray-400 line-clamp-2">{friend.bio}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Discover */}
          <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MagnifyingGlassIcon className="w-6 h-6 text-sky-300" />
              <div>
                <h2 className="text-xl font-semibold">Discover Developers</h2>
                <p className="text-sm text-gray-400">Search by handle or scroll the live roster</p>
              </div>
            </div>

            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="developer-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchDevelopers(searchQuery)
                  }
                }}
                placeholder="Search by username"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => fetchDevelopers(searchQuery)}
                className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
              >
                Scan
              </button>
            </div>

            {searchError && (
              <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-700 text-red-200 rounded-lg">{searchError}</div>
            )}

            {searchLoading ? (
              <div className="py-16 text-center text-gray-400">
                <ArrowPathIcon className="w-6 h-6 mx-auto mb-3 animate-spin" />
                Searching developers...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No developers found. Try a new query.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.map((developer) => renderDeveloperCard(developer))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
