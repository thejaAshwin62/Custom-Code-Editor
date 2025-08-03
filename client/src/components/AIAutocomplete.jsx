"use client"

import { RiFileCopyLine, RiCheckLine } from "react-icons/ri"
import { useState } from "react"

const AIAutocomplete = ({ suggestions, theme, isActive, onActivate, onApplySuggestion }) => {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleApplySuggestion = (code) => {
    onApplySuggestion(code)
    setCopiedIndex(suggestions.findIndex((s) => s.code === code))
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="h-full flex flex-col">
      {suggestions.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-[#3c3c3c] border-[#5a5a5a] hover:bg-[#4a4a4a]"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className={`text-sm font-medium pr-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {suggestion.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApplySuggestion(suggestion.code)
                  }}
                  className={`p-1 rounded transition-colors flex-shrink-0 ${
                    theme === "dark" ? "hover:bg-[#5a5a5a] text-purple-400" : "hover:bg-gray-200 text-purple-600"
                  }`}
                >
                  {copiedIndex === index ? (
                    <RiCheckLine className="w-4 h-4 text-green-500" />
                  ) : (
                    <RiFileCopyLine className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre
                className={`text-xs overflow-x-auto p-2 rounded border ${
                  theme === "dark"
                    ? "bg-[#2d2d30] border-[#5a5a5a] text-gray-300"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                {suggestion.code}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              theme === "dark" ? "bg-purple-500/20" : "bg-purple-500/20"
            }`}
          >
            <span className={`text-2xl ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>✨</span>
          </div>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Click "Get Suggestions" to get AI-powered code improvements
          </p>
        </div>
      )}
    </div>
  )
}

export default AIAutocomplete
