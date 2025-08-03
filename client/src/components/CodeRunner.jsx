"use client"

import { useState } from "react"
import { RiPlayLine } from "react-icons/ri"

const CodeRunner = ({ code, language, theme, isActive, onActivate }) => {
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    setTimeout(() => {
      if (language === "javascript") {
        try {
          const result = `> Running JavaScript code...
> 
> fibonacci(10) = 55
> 
> Execution completed in 0.023s`
          setOutput(result)
        } catch (error) {
          setOutput(`Error: ${error.message}`)
        }
      } else {
        setOutput(`> Running ${language} code...
> 
> Output would appear here
> 
> Note: Full execution environment not available in demo`)
      }
      setIsRunning(false)
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Run Button */}
      <button
        onClick={runCode}
        disabled={isRunning}
        className={`mb-4 flex items-center justify-center space-x-2 py-2 px-4 rounded transition-all duration-200 ${
          theme === "dark"
            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-50"
            : "bg-green-500/20 hover:bg-green-500/30 text-green-600 disabled:opacity-50"
        }`}
      >
        <RiPlayLine className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`} />
        <span className="font-medium text-sm">{isRunning ? "Running..." : "Run Code"}</span>
      </button>

      {/* Output Terminal */}
      <div
        className={`flex-1 rounded border font-mono text-sm overflow-y-auto ${
          theme === "dark"
            ? "bg-[#1e1e1e] border-[#5a5a5a] text-green-400"
            : "bg-gray-900 border-gray-700 text-green-300"
        }`}
      >
        <div className="p-4">
          {output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <div className={`${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>Output will appear here...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeRunner
