"use client"

import { useState } from "react"
import { RiPlayLine, RiRefreshLine } from "react-icons/ri"

const CodeRunner = ({ code, language, theme, isActive, onActivate }) => {
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)

  const runCode = () => {
    setIsRunning(true)
    setOutput("")
    const startTime = Date.now()

    setTimeout(() => {
      const endTime = Date.now()
      setExecutionTime(endTime - startTime)

      if (language === "javascript") {
        try {
          const result = `╭─ JavaScript Execution
│
├─ Running fibonacci function...
│  fibonacci(10) = 55
│
├─ Memory usage: 2.4 MB
├─ Execution time: ${endTime - startTime}ms
│
╰─ ✅ Execution completed successfully`
          setOutput(result)
        } catch (error) {
          setOutput(`╭─ Execution Error
│
├─ ${error.message}
│
╰─ ❌ Execution failed`)
        }
      } else {
        setOutput(`╭─ ${language.charAt(0).toUpperCase() + language.slice(1)} Execution
│
├─ Code compiled successfully
├─ Output would appear here
├─ Memory usage: 1.8 MB
├─ Execution time: ${endTime - startTime}ms
│
╰─ ℹ️  Full execution environment not available in demo`)
      }
      setIsRunning(false)
    }, 1500)
  }

  const clearOutput = () => {
    setOutput("")
    setExecutionTime(0)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Control Panel */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
              theme === "dark"
                ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-400 border border-emerald-500/30 disabled:opacity-50 shadow-emerald-500/10"
                : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-600 border border-emerald-500/20 disabled:opacity-50 shadow-emerald-500/10"
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <RiPlayLine className="w-4 h-4" />
                <span>Execute Code</span>
              </>
            )}
          </button>

          <button
            onClick={clearOutput}
            disabled={!output}
            className={`p-2 rounded-xl transition-all duration-300 ${
              theme === "dark"
                ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50 disabled:opacity-50"
                : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50 disabled:opacity-50"
            }`}
            title="Clear Output"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
        </div>

        {executionTime > 0 && (
          <div
            className={`text-xs px-3 py-1 rounded-full ${
              theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                : "bg-gray-200/50 text-gray-600 border border-gray-300/50"
            }`}
          >
            {executionTime}ms
          </div>
        )}
      </div>

      {/* Enhanced Output Terminal */}
      <div
        className={`flex-1 rounded-xl border font-mono text-sm overflow-y-auto min-h-0 shadow-lg ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/50 text-emerald-400"
            : "bg-gradient-to-b from-gray-900 to-black border-gray-700 text-emerald-300"
        }`}
      >
        <div className="p-6">
          {output ? (
            <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-full text-center py-12 ${
                theme === "dark" ? "text-slate-500" : "text-gray-500"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-slate-800/50 border border-slate-700/50"
                    : "bg-gray-800/50 border border-gray-700/50"
                }`}
              >
                <RiPlayLine className="w-8 h-8" />
              </div>
              <p className="text-sm">Click "Execute Code" to run your program</p>
              <p className="text-xs mt-2 opacity-70">Output will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeRunner
