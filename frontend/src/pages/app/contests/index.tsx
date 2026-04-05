import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TrophyIcon, ClockIcon, UsersIcon, FlagIcon } from '@heroicons/react/24/outline'
interface Contest {
  _id: string
  name: string
  description: string
  startTime: string
  duration: number
  problems: number
  participants: number
  status: 'upcoming' | 'active' | 'completed'
}
export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([
    {
      _id: 'contest1',
      name: 'Weekly Challenge #45',
      description: 'Test your skills with dynamic programming problems',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      duration: 120,
      problems: 4,
      participants: 234,
      status: 'upcoming'
    },
    {
      _id: 'contest2',
      name: 'Algorithm Sprint',
      description: 'Fast-paced algorithms and data structures',
      startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      duration: 90,
      problems: 5,
      participants: 189,
      status: 'active'
    },
    {
      _id: 'contest3',
      name: 'Graph Theory Masters',
      description: 'Advanced graph algorithms',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      duration: 180,
      problems: 6,
      participants: 312,
      status: 'completed'
    }
  ])
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-700 rounded-full text-xs font-semibold">Upcoming</span>
      case 'active':
        return <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-700 rounded-full text-xs font-semibold animate-pulse">Active</span>
      case 'completed':
        return <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs font-semibold">Completed</span>
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        {}
        <div className="bg-gray-950 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Contests</h1>
              <p className="text-gray-400 mt-1">Compete with developers worldwide</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
              Create Contest
            </button>
          </div>
          {}
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-indigo-600 rounded-lg font-medium">
              All Contests
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Active
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Upcoming
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Past
            </button>
          </div>
        </div>
        {}
        <div className="p-6">
          <div className="space-y-4">
            {contests.map((contest) => (
              <div
                key={contest._id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold group-hover:text-indigo-400 transition">
                        {contest.name}
                      </h3>
                      {getStatusBadge(contest.status)}
                    </div>
                    <p className="text-gray-400">{contest.description}</p>
                  </div>
                  <TrophyIcon className="w-8 h-8 text-yellow-500 flex-shrink-0 ml-4" />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDate(contest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{contest.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FlagIcon className="w-4 h-4" />
                    <span>{contest.problems} problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <UsersIcon className="w-4 h-4" />
                    <span>{contest.participants} participants</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {contest.status === 'upcoming' && (
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
                      Register
                    </button>
                  )}
                  {contest.status === 'active' && (
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition animate-pulse">
                      Join Now
                    </button>
                  )}
                  {contest.status === 'completed' && (
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition">
                      View Leaderboard
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
