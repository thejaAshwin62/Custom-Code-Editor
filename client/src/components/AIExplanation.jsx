"use client"

import { useState, useEffect } from "react"
import { RiBrainLine, RiBookOpenLine } from "react-icons/ri"

const AIExplanation = ({ explanation, isExplaining, theme, isActive, onActivate }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (explanation && !isExplaining) {
      setIsTyping(true)
      setDisplayedText("")

      let index = 0
      const timer = setInterval(() => {
        if (index < explanation.length) {
          setDisplayedText(explanation.slice(0, index + 1))
          index++
        } else {
          setIsTyping(false)
          clearInterval(timer)
        }
      }, 20)

      return () => clearInterval(timer)
    }
  }, [explanation, isExplaining])

  return (
    <div className="h-full flex flex-col">
      {isExplaining ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                theme === "dark"
                  ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
              }`}
            >
              <RiBrainLine
                className={`w-10 h-10 animate-pulse ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              AI is analyzing your code
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Please wait while I examine the logic and structure...
            </p>
          </div>
        </div>
      ) : explanation ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div
            className={`p-6 rounded-xl border mb-4 ${
              theme === "dark"
                ? "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
                : "bg-gray-50/50 border-gray-200/50 backdrop-blur-sm"
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-emerald-500/20 border border-emerald-500/30"
                    : "bg-emerald-500/10 border border-emerald-500/20"
                }`}
              >
                <RiBookOpenLine className={`w-5 h-5 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
              </div>
              <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Code Explanation</h3>
            </div>
            <div className={`prose prose-sm max-w-none ${theme === "dark" ? "prose-invert" : ""}`}>
              <pre
                className={`whitespace-pre-wrap text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {displayedText}
                {isTyping && (
                  <span
                    className={`inline-block w-2 h-5 ml-1 animate-pulse ${
                      theme === "dark" ? "bg-emerald-400" : "bg-emerald-600"
                    }`}
                  />
                )}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              theme === "dark"
                ? "bg-slate-800/50 border border-slate-700/50 shadow-xl"
                : "bg-gray-100/50 border border-gray-300/50 shadow-xl"
            }`}
          >
            <RiBrainLine className={`w-10 h-10 ${theme === "dark" ? "text-slate-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Ready to Explain
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
              Click "Explain Code" to get AI insights about your code structure, logic, and best practices
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIExplanation
