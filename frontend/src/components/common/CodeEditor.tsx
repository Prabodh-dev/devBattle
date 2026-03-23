import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string | undefined) => void
  onRun?: () => void
  onSubmit?: () => void
  readOnly?: boolean
  height?: string
  showActions?: boolean
  theme?: 'vs-dark' | 'light'
}

const languageOptions = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' }
]

export default function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  onSubmit,
  readOnly = false,
  height = '500px',
  showActions = true,
  theme = 'vs-dark'
}: CodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleRun = async () => {
    if (onRun) {
      setIsRunning(true)
      try {
        await onRun()
      } finally {
        setIsRunning(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {showActions && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Language:</span>
            <span className="text-sm font-medium text-white">
              {languageOptions.find(l => l.value === language)?.label || language}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onRun && (
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
              >
                {isRunning ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
                Run
              </button>
            )}
            {onSubmit && (
              <button
                onClick={onSubmit}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex-1" style={{ height: showActions ? `calc(${height} - 48px)` : height }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme={theme}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>
    </div>
  )
}
