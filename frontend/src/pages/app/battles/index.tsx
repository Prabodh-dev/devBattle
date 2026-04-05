import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import {
  TrophyIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/lib/store'
import { battleAPI, userAPI } from '@/lib/api'
type BattleStatus = 'pending' | 'accepted' | 'in_progress' | 'declined' | 'completed' | 'cancelled'
interface BattleUser {
  _id: string
  username: string
  rating: number
  avatar?: string
}
interface BattleProblem {
  _id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}
interface Battle {
  _id: string
  challenger: BattleUser
  opponent: BattleUser
  problem?: BattleProblem
  status: BattleStatus
  winner?: BattleUser | string
  duration?: number
  createdAt: string
}
export default function BattlesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const currentUserId = user?._id || ''
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active')
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<BattleUser[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState('')
  const [creatingBattle, setCreatingBattle] = useState(false)
  const [acceptingBattleId, setAcceptingBattleId] = useState('')
  const [decliningBattleId, setDecliningBattleId] = useState('')
  const [opponentSearch, setOpponentSearch] = useState('')
  useEffect(() => {
    if (!currentUserId) return
    loadBattles()
    loadOpponents()
  }, [currentUserId])
  const loadBattles = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await battleAPI.getBattles()
      if (response.success) {
        setBattles(response.data)
      }
    } catch (err: any) {
      console.error('Failed to load battles:', err)
      setError(err.response?.data?.message || 'Failed to load battles')
    } finally {
      setLoading(false)
    }
  }
  const loadOpponents = async () => {
    try {
      const response = await userAPI.searchUsers('')
      if (response.success) {
        setAvailableUsers(response.data.filter((candidate: any) => candidate._id !== currentUserId))
      }
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }
  const filteredBattles = useMemo(() => {
    return battles.filter((battle) => {
      if (activeTab === 'active') return battle.status === 'in_progress'
      if (activeTab === 'pending') return battle.status === 'pending'
      if (activeTab === 'history') return ['completed', 'declined', 'cancelled'].includes(battle.status)
      return true
    })
  }, [battles, activeTab])
  const filteredOpponents = useMemo(() => {
    if (!opponentSearch.trim()) return availableUsers
    const query = opponentSearch.toLowerCase()
    return availableUsers.filter((candidate) => candidate.username.toLowerCase().includes(query))
  }, [availableUsers, opponentSearch])
  const summaryStats = useMemo(() => {
    const active = battles.filter((b) => b.status === 'in_progress').length
    const pending = battles.filter((b) => b.status === 'pending').length
    const completed = battles.filter((b) => b.status === 'completed').length
    const wins = battles.filter((b) => {
      if (b.status !== 'completed') return false
      if (!b.winner) return false
      if (typeof b.winner === 'string') return b.winner === currentUserId
      return b.winner?._id === currentUserId
    }).length
    const winRate = completed > 0 ? Math.round((wins / completed) * 100) : 0
    return { active, pending, completed, winRate }
  }, [battles, currentUserId])
  const statusMeta: Record<BattleStatus, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'text-yellow-300 border-yellow-600 bg-yellow-900/20',
    },
    accepted: {
      label: 'Accepted',
      className: 'text-blue-300 border-blue-500 bg-blue-900/20',
    },
    in_progress: {
      label: 'In Progress',
      className: 'text-green-300 border-green-500 bg-green-900/20',
    },
    completed: {
      label: 'Completed',
      className: 'text-emerald-300 border-emerald-500 bg-emerald-900/20',
    },
    declined: {
      label: 'Declined',
      className: 'text-red-300 border-red-500 bg-red-900/20',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'text-gray-300 border-gray-600 bg-gray-900/30',
    },
  }
  const summaryCards = [
    {
      label: 'Active Battles',
      value: summaryStats.active,
      subtext: 'Live rooms ready to join',
      icon: FireIcon,
      accent: 'text-orange-400',
    },
    {
      label: 'Pending Challenges',
      value: summaryStats.pending,
      subtext: 'Awaiting a response',
      icon: ClockIcon,
      accent: 'text-yellow-300',
    },
    {
      label: 'Completed Battles',
      value: summaryStats.completed,
      subtext: 'Results in the last 50 duels',
      icon: TrophyIcon,
      accent: 'text-green-300',
    },
    {
      label: 'Win Rate',
      value: `${summaryStats.winRate}%`,
      subtext: summaryStats.completed ? 'Based on completed battles' : 'Complete battles to unlock stats',
      icon: ShieldCheckIcon,
      accent: 'text-indigo-300',
    },
  ]
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-900/20 border-green-700'
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      case 'Hard':
        return 'text-red-400 bg-red-900/20 border-red-700'
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-700'
    }
  }
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }
  const getOpponent = (battle: Battle) => {
    if (battle.challenger?._id === currentUserId) return battle.opponent
    return battle.challenger
  }
  const getInitials = (username?: string) => {
    if (!username) return '?'
    return username
      .split(' ')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }
  const isWinner = (battle: Battle) => {
    if (!battle.winner) return false
    if (typeof battle.winner === 'string') return battle.winner === currentUserId
    return battle.winner?._id === currentUserId
  }
  const closeCreateModal = () => {
    setShowCreateModal(false)
    setSelectedOpponent('')
    setOpponentSearch('')
  }
  const joinBattleRoom = (battleId: string) => {
    router.push(`/app/battles/${battleId}`)
  }
  const minutesFromDuration = (duration?: number) => {
    if (!duration) return 30
    return Math.max(5, Math.round(duration / 60000))
  }
  const handleCreateBattle = async () => {
    if (!selectedOpponent) return
    try {
      setCreatingBattle(true)
      await battleAPI.createBattle({ opponentId: selectedOpponent })
      setShowCreateModal(false)
      setSelectedOpponent('')
      await loadBattles()
    } catch (err: any) {
      console.error('Failed to create battle:', err)
      alert(err.response?.data?.message || 'Failed to create battle')
    } finally {
      setCreatingBattle(false)
    }
  }
  const handleAcceptBattle = async (battleId: string) => {
    try {
      setAcceptingBattleId(battleId)
      await battleAPI.acceptBattle(battleId)
      await loadBattles()
    } catch (err: any) {
      console.error('Failed to accept battle:', err)
      alert(err.response?.data?.message || 'Failed to accept battle')
    } finally {
      setAcceptingBattleId('')
    }
  }
  const handleDeclineBattle = async (battleId: string) => {
    try {
      setDecliningBattleId(battleId)
      await battleAPI.declineBattle(battleId)
      await loadBattles()
    } catch (err: any) {
      console.error('Failed to decline battle:', err)
      alert(err.response?.data?.message || 'Failed to decline battle')
    } finally {
      setDecliningBattleId('')
    }
  }
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading battles...</p>
            </div>
          </div>
        )}
        {}
        <div className="bg-gray-950 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Battles</h1>
              <p className="text-gray-400">Challenge developers to 1v1 coding battles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
            >
              <PlusIcon className="w-5 h-5" />
              New Challenge
            </button>
          </div>
          {}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'active'
                    ? 'bg-indigo-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'pending'
                    ? 'bg-indigo-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'history'
                    ? 'bg-indigo-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                History
              </button>
            </div>
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
              {error}
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-800 ${card.accent.replace('text-', 'text-')} bg-opacity-40`}>
                  <card.icon className={`w-6 h-6 ${card.accent}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="text-2xl font-semibold">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {}
        <div className="max-w-6xl mx-auto p-6">
          {filteredBattles.length === 0 ? (
            <div className="text-center py-20">
              <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === 'active' && 'No active battles'}
                {activeTab === 'pending' && 'No pending challenges'}
                {activeTab === 'history' && 'No battle history'}
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'active' && 'Join a battle to start competing'}
                {activeTab === 'pending' && 'Challenge someone to start'}
                {activeTab === 'history' && 'Complete some battles to see your history'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
              >
                Challenge Someone
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBattles.map((battle) => {
                const opponent = getOpponent(battle)
                const selfUser = battle.challenger?._id === currentUserId ? battle.challenger : battle.opponent
                const awaitingCurrentUser = battle.status === 'pending' && battle.opponent?._id === currentUserId
                const isChallenger = battle.challenger?._id === currentUserId
                const status = statusMeta[battle.status]
                return (
                  <div
                    key={battle._id}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        {}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-semibold">
                            {getInitials(selfUser?.username)}
                          </div>
                          <div>
                            <div className="font-semibold">{selfUser?.username || 'You'}</div>
                            <div className="text-sm text-gray-400">Rating: {selfUser?.rating ?? '—'}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-600">VS</div>
                        {}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-semibold">
                            {getInitials(opponent?.username)}
                          </div>
                          <div>
                            <div className="font-semibold">{opponent?.username || 'Opponent TBD'}</div>
                            <div className="text-sm text-gray-400">Rating: {opponent?.rating ?? '—'}</div>
                          </div>
                        </div>
                        <div className="h-12 w-px bg-gray-700" />
                        {}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold group-hover:text-indigo-400 transition">
                              {battle.problem?.title || 'Problem pending assignment'}
                            </h3>
                            {battle.problem?.difficulty && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(
                                  battle.problem.difficulty
                                )}`}
                              >
                                {battle.problem.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {minutesFromDuration(battle.duration)} minutes
                            </span>
                            <span>{formatTime(battle.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {}
                      <div className="flex flex-col items-end gap-3 w-52">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                        {battle.status === 'in_progress' && (
                          <button
                            onClick={() => joinBattleRoom(battle._id)}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
                          >
                            Join Battle
                          </button>
                        )}
                        {battle.status === 'pending' && awaitingCurrentUser && (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleAcceptBattle(battle._id)}
                              disabled={acceptingBattleId === battle._id}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-70 rounded-lg text-sm font-medium transition"
                            >
                              {acceptingBattleId === battle._id ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckIcon className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineBattle(battle._id)}
                              disabled={decliningBattleId === battle._id}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-70 rounded-lg text-sm font-medium transition"
                            >
                              {decliningBattleId === battle._id ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                <XMarkIcon className="w-4 h-4" />
                              )}
                              Decline
                            </button>
                          </div>
                        )}
                        {battle.status === 'pending' && isChallenger && (
                          <p className="text-sm text-gray-400 text-right">
                            Waiting for {opponent?.username || 'opponent'}
                          </p>
                        )}
                        {battle.status === 'completed' && (
                          <div className="w-full text-center">
                            {isWinner(battle) ? (
                              <div className="px-4 py-2 bg-green-900/20 border border-green-700 rounded-lg">
                                <TrophyIcon className="w-6 h-6 text-green-400 mx-auto mb-1" />
                                <span className="text-sm font-semibold text-green-400">Victory</span>
                              </div>
                            ) : (
                              <div className="px-4 py-2 bg-red-900/20 border border-red-700 rounded-lg">
                                <span className="text-sm font-semibold text-red-400">Defeat</span>
                              </div>
                            )}
                          </div>
                        )}
                        {['declined', 'cancelled'].includes(battle.status) && (
                          <p className="text-sm text-gray-400 text-right">
                            {battle.status === 'declined' ? 'Challenge declined' : 'Challenge cancelled'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 px-4">
            <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Start a Challenge</h3>
                  <p className="text-sm text-gray-400">Pick an opponent to send a 1v1 invite</p>
                </div>
                <button onClick={closeCreateModal} className="p-2 rounded-lg hover:bg-gray-800 transition">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={opponentSearch}
                  onChange={(e) => setOpponentSearch(e.target.value)}
                  placeholder="Search by username"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {filteredOpponents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No developers found.</p>
                ) : (
                  filteredOpponents.map((candidate) => (
                    <button
                      key={candidate._id}
                      onClick={() => setSelectedOpponent(candidate._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-left ${
                        selectedOpponent === candidate._id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-800 hover:border-indigo-500'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{candidate.username}</p>
                        <p className="text-xs text-gray-400">Rating: {candidate.rating ?? '—'}</p>
                      </div>
                      {selectedOpponent === candidate._id && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                    </button>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBattle}
                  disabled={!selectedOpponent || creatingBattle}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:opacity-70 font-medium transition flex items-center gap-2"
                >
                  {creatingBattle && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  Send Challenge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
