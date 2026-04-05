import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TrophyIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { leaderboardAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
interface LeaderboardEntry {
  rank: number
  user: {
    _id: string
    username: string
    avatar?: string
  }
  rating: number
  tier: string
  problemsSolved: number
  battlesWon: number
  contestsWon: number
}
export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'global' | 'battles' | 'contests'>('global')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  useEffect(() => {
    loadLeaderboard()
  }, [activeTab, page])
  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError('')
      let response
      if (activeTab === 'global') {
        response = await leaderboardAPI.getGlobalLeaderboard(page, 50)
      } else if (activeTab === 'battles') {
        response = await leaderboardAPI.getBattleLeaderboard(page, 50)
      } else {
        response = await leaderboardAPI.getContestLeaderboard(page, 50)
      }
      if (response.success) {
        const transformedData = response.data.map((entry: any, index: number) => ({
          rank: (page - 1) * 50 + index + 1,
          user: entry.user,
          rating: entry.rating || 0,
          tier: entry.tier || 'Beginner',
          problemsSolved: entry.problemsSolved || 0,
          battlesWon: entry.battlesWon || 0,
          contestsWon: entry.contestsWon || 0
        }))
        setLeaderboard(transformedData)
      } else {
        setError(response.message || 'Failed to load leaderboard')
      }
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err)
      setError(err.response?.data?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'text-gray-400',
      'Coder': 'text-green-400',
      'Expert': 'text-blue-400',
      'Master': 'text-purple-400',
      'Grandmaster': 'text-red-400'
    }
    return colors[tier] || 'text-gray-400'
  }
  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-600'
  }
  if (loading && leaderboard.length === 0) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        {}
        <div className="bg-gradient-to-r from-yellow-900 via-orange-900 to-red-900 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <TrophyIcon className="w-12 h-12 text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold">Leaderboard</h1>
                <p className="text-gray-300">Top developers on DevBattle</p>
              </div>
            </div>
            {}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('global')
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'global'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => {
                  setActiveTab('battles')
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'battles'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                Battles
              </button>
              <button
                onClick={() => {
                  setActiveTab('contests')
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'contests'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                Contests
              </button>
            </div>
          </div>
        </div>
        {}
        {error && (
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
              {error}
              <button
                onClick={loadLeaderboard}
                className="ml-4 text-sm underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        {}
        {leaderboard.length >= 3 && (
        <div className="max-w-6xl mx-auto px-8 -mt-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {}
            <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-400 mt-8">
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center font-bold text-xl">
                    {leaderboard[1]?.user.avatar || leaderboard[1]?.user.username[0]}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-bold text-gray-900">
                    2
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[1].user.username}</h3>
                <p className={`text-sm font-semibold mb-2 ${getTierColor(leaderboard[1].tier)}`}>
                  {leaderboard[1].tier}
                </p>
                <div className="text-2xl font-bold text-gray-300">{leaderboard[1].rating}</div>
              </div>
            </div>
            {}
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-xl p-6 border-2 border-yellow-400">
              <div className="text-center">
                <TrophyIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-2xl text-gray-900">
                    {leaderboard[0].user.avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900">
                    1
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-1">{leaderboard[0].user.username}</h3>
                <p className={`text-sm font-semibold mb-2 ${getTierColor(leaderboard[0].tier)}`}>
                  {leaderboard[0].tier}
                </p>
                <div className="text-3xl font-bold text-yellow-400">{leaderboard[0].rating}</div>
              </div>
            </div>
            {}
            <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-600 mt-8">
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center font-bold text-xl">
                    {leaderboard[2].user.avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white">
                    3
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{leaderboard[2].user.username}</h3>
                <p className={`text-sm font-semibold mb-2 ${getTierColor(leaderboard[2].tier)}`}>
                  {leaderboard[2].tier}
                </p>
                <div className="text-2xl font-bold text-orange-600">{leaderboard[2].rating}</div>
              </div>
            </div>
          </div>
          {}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Tier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Problems</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Battles</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Contests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboard.map((entry) => (
                  <tr key={entry.user._id} className="hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 ? (
                          <TrophyIcon className={`w-5 h-5 ${getTrophyColor(entry.rank)}`} />
                        ) : (
                          <span className="text-gray-400 font-medium">#{entry.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold">
                          {entry.user.avatar}
                        </div>
                        <span className="font-medium">{entry.user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getTierColor(entry.tier)}`}>
                        {entry.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg">{entry.rating}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{entry.problemsSolved}</td>
                    <td className="px-6 py-4 text-gray-400">{entry.battlesWon}</td>
                    <td className="px-6 py-4 text-gray-400">{entry.contestsWon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
        {}
        {leaderboard.length === 0 && !loading && !error && (
          <div className="max-w-6xl mx-auto px-8 py-20 text-center">
            <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No rankings yet</h3>
            <p className="text-gray-400">Start competing to see your name on the leaderboard!</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
