import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import CodeEditor from '@/components/common/CodeEditor'
import { PlayIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'

const starterCode = {
  python: '# Python Playground\nprint("Hello, DevBattle!")\n\ndef main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()',
  javascript: '// JavaScript Playground\nconsole.log("Hello, DevBattle!");\n\nfunction main() {\n    // Your code here\n}\n\nmain();',
  java: '// Java Playground\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DevBattle!");\n        // Your code here\n    }\n}',
  cpp: '// C++ Playground\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, DevBattle!" << endl;\n    // Your code here\n    return 0;\n}',
  c: '// C Playground\n#include <stdio.h>\n\nint main() {\n    printf("Hello, DevBattle!\\n");\n    // Your code here\n    return 0;\n}'
}

export default function PlaygroundPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCode.javascript)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCode(starterCode[newLanguage as keyof typeof starterCode] || '')
    setOutput('')
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('Running code...')
    
    // Simulate code execution
    setTimeout(() => {
      const mockOutput = `Hello, DevBattle!\n\nExecution completed successfully.`
      setOutput(mockOutput)
      setExecutionTime(Math.random() * 100 + 50)
      setIsRunning(false)
    }, 1000)
  }

  const handleShare = () => {
    alert('Share functionality coming soon! Your code will be saved with a unique URL.')
  }

  const handleSave = () => {
    alert('Code snippet saved!')
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">Code Playground</h1>
              <p className="text-sm text-gray-400">Write, run, and share code instantly</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Language:</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition"
              >
                <BookmarkIcon className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
              >
                <PlayIcon className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor & Output */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 p-4">
            <CodeEditor
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              height="calc(100vh - 180px)"
              showActions={false}
            />
          </div>

          {/* Output Panel */}
          <div className="w-96 border-l border-gray-800 flex flex-col">
            <div className="bg-gray-950 border-b border-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Output</h3>
                {executionTime !== null && (
                  <span className="text-xs text-gray-400">
                    {executionTime.toFixed(2)}ms
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {output ? (
                <div>
                  <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                    {output}
                  </pre>
                  
                  {executionTime !== null && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Execution Stats</h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Runtime:</span>
                          <span className="text-green-400">{executionTime.toFixed(2)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory:</span>
                          <span className="text-blue-400">2.4 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-400">Success</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500">
                  <div>
                    <svg
                      className="w-16 h-16 mx-auto mb-3 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>Run your code to see output</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
