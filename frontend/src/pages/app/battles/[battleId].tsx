import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AppLayout from '@/components/layout/AppLayout'
import CodeEditor from '@/components/common/CodeEditor'
import { ClockIcon, TrophyIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
interface Battle {
  _id: string
  problem: {
    title: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    description: string
    examples: Array<{ input: string; output: string; explanation?: string }>
    constraints: string[]
  }
  challenger: {
    _id: string
    username: string
    rating: number
  }
  opponent: {
    _id: string
    username: string
    rating: number
  }
  status: 'pending' | 'active' | 'completed'
  timeLimit: number
  startedAt?: string
  winner?: string
  submissions: Array<{
    user: string
    status: string
    submittedAt: string
  }>
}
export default function BattlePage() {
  const router = useRouter()
  const { battleId } = router.query
  const [currentUserId] = useState('user123')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('
  const [timeRemaining, setTimeRemaining] = useState(900) 
  const [output, setOutput] = useState('')
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; input: string; expected: string; actual: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const battle: Battle = {
    _id: 'battle1',
    problem: {
      title: 'Two Sum',
      difficulty: 'Easy',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]'
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ]
    },
    challenger: {
      _id: 'user123',
      username: 'You',
      rating: 1850
    },
    opponent: {
      _id: 'user456',
      username: 'CodeNinja',
      rating: 1920
    },
    status: 'active',
    timeLimit: 900,
    startedAt: new Date().toISOString(),
    submissions: []
  }
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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }
  const handleRun = async () => {
    setOutput('Running test cases...')
    setTimeout(() => {
      setOutput('Test case 1: Passed\nTest case 2: Passed\nTest case 3: Failed\n\nExpected: [0,1]\nGot: [1,0]')
      setTestResults([
        { passed: true, input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]' },
        { passed: true, input: '[3,2,4], 6', expected: '[1,2]', actual: '[1,2]' },
        { passed: false, input: '[3,3], 6', expected: '[0,1]', actual: '[1,0]' }
      ])
    }, 1000)
  }
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Code submitted! Running all test cases...')
    }, 1000)
  }
  const rightPanelContent = (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Battle Info</h3>
      <div className="space-y-4">
        {}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ClockIcon className="w-4 h-4" />
            <span className="text-sm">Time Remaining</span>
          </div>
          <div className={`text-3xl font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
        {}
        <div className="space-y-2">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  You
                </div>
                <span className="font-semibold">{battle.challenger.username}</span>
              </div>
              <span className="text-sm text-gray-400">{battle.challenger.rating}</span>
            </div>
            <div className="text-xs text-gray-400">
              {battle.submissions.filter(s => s.user === currentUserId).length} submissions
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm font-semibold">VS</div>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm">
                  {battle.opponent.username[0]}
                </div>
                <span className="font-semibold">{battle.opponent.username}</span>
              </div>
              <span className="text-sm text-gray-400">{battle.opponent.rating}</span>
            </div>
            <div className="text-xs text-gray-400">
              {battle.submissions.filter(s => s.user === battle.opponent._id).length} submissions
            </div>
          </div>
        </div>
        {}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Battle Status</h4>
          <div className="space-y-1 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Battle in progress</span>
            </div>
            <div>First accepted solution wins</div>
          </div>
        </div>
      </div>
    </div>
  )
  return (
    <AppLayout showRightPanel={true} rightPanelContent={rightPanelContent}>
      <div className="flex h-full">
        {}
        <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{battle.problem.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(battle.problem.difficulty)}`}>
              {battle.problem.difficulty}
            </span>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{battle.problem.description}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Examples</h3>
              {battle.problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 mb-3">
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Input:</span>
                    <pre className="text-sm mt-1 text-green-400">{example.input}</pre>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Output:</span>
                    <pre className="text-sm mt-1 text-blue-400">{example.output}</pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className="text-sm text-gray-400">Explanation:</span>
                      <p className="text-sm mt-1 text-gray-300">{example.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {battle.problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm">{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
            <CodeEditor
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onRun={handleRun}
              onSubmit={handleSubmit}
              height="calc(100vh - 300px)"
            />
          </div>
          {}
          <div className="h-48 border-t border-gray-800 bg-gray-950 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Test Results</h3>
                {testResults.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {testResults.filter(t => t.passed).length}/{testResults.length} passed
                  </span>
                )}
              </div>
              {output ? (
                <div>
                  {testResults.length > 0 ? (
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.passed
                              ? 'bg-green-900/20 border-green-700'
                              : 'bg-red-900/20 border-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {result.passed ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-red-400" />
                            )}
                            <span className="font-semibold">Test Case {index + 1}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            <div>Input: {result.input}</div>
                            {!result.passed && (
                              <>
                                <div className="text-red-400">Expected: {result.expected}</div>
                                <div className="text-yellow-400">Got: {result.actual}</div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-300 font-mono bg-gray-900 p-3 rounded-lg overflow-x-auto">
                      {output}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Run your code to see test results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
