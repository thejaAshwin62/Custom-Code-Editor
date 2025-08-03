"use client"

import { useState, useEffect } from "react"
import { RiBrainLine } from "react-icons/ri"

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
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className={`relative ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            <RiBrainLine className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className={`text-sm text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            AI is analyzing your code...
          </div>
        </div>
      ) : explanation ? (
        <div className="flex-1 overflow-y-auto">
          <pre
            className={`whitespace-pre-wrap text-sm leading-relaxed ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {displayedText}
            {isTyping && (
              <span
                className={`inline-block w-2 h-5 ml-1 animate-pulse ${
                  theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                }`}
              />
            )}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <RiBrainLine className={`w-12 h-12 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Click "Explain Code" to get AI insights about your code
          </p>
        </div>
      )}
    </div>
  )
}

export default AIExplanation
