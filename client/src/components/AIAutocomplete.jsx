"use client"

import { RiFileCopyLine, RiCheckLine, RiLightbulbLine } from "react-icons/ri"
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
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border transition-all duration-300 shadow-lg ${
                theme === "dark"
                  ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 backdrop-blur-sm"
                  : "bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/70 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-purple-500/20 border border-purple-500/30"
                        : "bg-purple-500/10 border border-purple-500/20"
                    }`}
                  >
                    <RiLightbulbLine
                      className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}
                    />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {suggestion.description}
                    </h4>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                      AI-generated improvement suggestion
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApplySuggestion(suggestion.code)
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-purple-400 border border-purple-500/30 hover:border-purple-500/50"
                      : "hover:bg-gray-200/50 text-purple-600 border border-purple-500/20 hover:border-purple-500/40"
                  }`}
                  title="Apply this suggestion"
                >
                  {copiedIndex === index ? (
                    <RiCheckLine className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <RiFileCopyLine className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div
                className={`rounded-xl border overflow-hidden ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-700/50" : "bg-white/50 border-gray-200/50"
                }`}
              >
                <div
                  className={`px-4 py-2 text-xs font-medium border-b ${
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                      : "bg-gray-100/50 border-gray-200/50 text-gray-600"
                  }`}
                >
                  Suggested Code
                </div>
                <pre
                  className={`text-xs overflow-x-auto p-4 ${
                    theme === "dark" ? "text-gray-300 bg-slate-900/30" : "text-gray-700 bg-white/30"
                  }`}
                >
                  {suggestion.code}
                </pre>
              </div>
            </div>
          ))}
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
            <RiLightbulbLine className={`w-10 h-10 ${theme === "dark" ? "text-slate-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Ready for Suggestions
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
              Click "Get Suggestions" to receive AI-powered code improvements, optimizations, and best practice
              recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAutocomplete
