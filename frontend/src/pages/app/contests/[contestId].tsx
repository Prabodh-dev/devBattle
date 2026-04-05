import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import { TrophyIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
interface LeaderboardEntry {
  rank: number
  user: {
    _id: string
    username: string
    avatar?: string
  }
  score: number
  solved: number
  time: number
}
interface Problem {
  _id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  points: number
  solved: boolean
  attempts: number
}
export default function ContestDetailPage() {
  const router = useRouter()
  const { contestId } = router.query
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems')
  const [timeRemaining, setTimeRemaining] = useState(5400) 
  const problems: Problem[] = [
    { _id: 'p1', title: 'Two Sum', difficulty: 'Easy', points: 100, solved: true, attempts: 2 },
    { _id: 'p2', title: 'Binary Tree Level Order', difficulty: 'Medium', points: 200, solved: true, attempts: 1 },
    { _id: 'p3', title: 'Merge K Sorted Lists', difficulty: 'Hard', points: 300, solved: false, attempts: 3 },
    { _id: 'p4', title: 'Valid Parentheses', difficulty: 'Easy', points: 100, solved: false, attempts: 0 },
    { _id: 'p5', title: 'Longest Substring Without Repeating', difficulty: 'Medium', points: 200, solved: false, attempts: 1 }
  ]
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, user: { _id: 'u1', username: 'CodeMaster' }, score: 800, solved: 4, time: 3245 },
    { rank: 2, user: { _id: 'u2', username: 'AlgoExpert' }, score: 700, solved: 4, time: 4120 },
    { rank: 3, user: { _id: 'u3', username: 'DevNinja' }, score: 600, solved: 3, time: 2890 },
    { rank: 4, user: { _id: 'u4', username: 'You' }, score: 300, solved: 2, time: 1567 },
    { rank: 5, user: { _id: 'u5', username: 'PyMaster' }, score: 300, solved: 2, time: 2100 }
  ]
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/20 border-green-700'
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      case 'Hard': return 'text-red-400 bg-red-900/20 border-red-700'
      default: return 'text-gray-400'
    }
  }
  const rightPanelContent = (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Contest Timer</h3>
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <ClockIcon className="w-4 h-4" />
          <span className="text-sm">Time Remaining</span>
        </div>
        <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold mb-3">Your Progress</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Score</span>
            <span className="font-semibold">300 pts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Solved</span>
            <span className="font-semibold">2 / 5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Rank</span>
            <span className="font-semibold">#4</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2">Contest Info</h4>
        <div className="space-y-1 text-sm text-gray-400">
          <div>189 participants</div>
          <div>90 minutes duration</div>
          <div>5 problems</div>
        </div>
      </div>
    </div>
  )
  return (
    <AppLayout showRightPanel={true} rightPanelContent={rightPanelContent}>
      <div className="h-full flex flex-col">
        {}
        <div className="bg-gray-950 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Algorithm Sprint</h1>
              <p className="text-gray-400">Fast-paced algorithms and data structures</p>
            </div>
            <div className="px-4 py-2 bg-green-900/30 text-green-400 border border-green-700 rounded-lg font-semibold animate-pulse">
              Active
            </div>
          </div>
          {}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'problems'
                  ? 'bg-indigo-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
        {}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'problems' ? (
            <div className="space-y-3">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {problem.solved ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : problem.attempts > 0 ? (
                        <XCircleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition">
                            {problem.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{problem.points} points</span>
                          {problem.attempts > 0 && (
                            <span>{problem.attempts} {problem.attempts === 1 ? 'attempt' : 'attempts'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
                      {problem.solved ? 'View Solution' : 'Solve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Solved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.user._id}
                        className={`hover:bg-gray-750 ${
                          entry.user.username === 'You' ? 'bg-indigo-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.rank <= 3 ? (
                              <TrophyIcon
                                className={`w-5 h-5 ${
                                  entry.rank === 1
                                    ? 'text-yellow-400'
                                    : entry.rank === 2
                                    ? 'text-gray-400'
                                    : 'text-orange-600'
                                }`}
                              />
                            ) : (
                              <span className="text-gray-400 font-medium">#{entry.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {entry.user.username[0]}
                            </div>
                            <span className="font-medium">{entry.user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold">{entry.score}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-400">{entry.solved} / 5</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-400">{formatTime(entry.time)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
