"use client"

import { useState } from "react"

const BentoCard = ({ title, icon, children, theme, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        transition-all duration-500 ease-out flex flex-col
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:from-slate-800/80 hover:to-slate-900/80"
            : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50 hover:from-white/80 hover:to-gray-50/80"
        }
        ${isHovered ? "shadow-2xl scale-[1.02]" : "shadow-xl"}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Glass effect overlay */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent"
            : "bg-gradient-to-br from-emerald-500/5 via-blue-500/3 to-transparent"
        }`}
      />

      {/* Animated border gradient */}
      <div
        className={`absolute inset-0 rounded-2xl ${
          isHovered
            ? theme === "dark"
              ? "bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20"
              : "bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10"
            : ""
        } transition-all duration-500`}
        style={{
          background: isHovered
            ? `conic-gradient(from 0deg, ${
                theme === "dark"
                  ? "rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(16, 185, 129, 0.2)"
                  : "rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(16, 185, 129, 0.1)"
              })`
            : "none",
          padding: "1px",
        }}
      >
        <div
          className={`w-full h-full rounded-2xl ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90"
              : "bg-gradient-to-br from-white/90 to-gray-50/90"
          }`}
        />
      </div>

      {/* Enhanced Header */}
      <div
        className={`relative z-10 px-6 py-5 border-b flex-shrink-0 ${
          theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl shadow-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-emerald-500/10"
                : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-emerald-500/10"
            }`}
          >
            <div
              className={`transition-all duration-300 ${
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              } ${isHovered ? "scale-110" : ""}`}
            >
              {icon}
            </div>
          </div>
          <div>
            <h3 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h3>
            <div
              className={`w-12 h-0.5 mt-1 rounded-full transition-all duration-500 ${
                isHovered
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-emerald-400 to-blue-400 w-20"
                    : "bg-gradient-to-r from-emerald-600 to-blue-600 w-20"
                  : theme === "dark"
                    ? "bg-slate-600"
                    : "bg-gray-300"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="relative z-10 p-6 flex-1 overflow-hidden min-h-0">{children}</div>
    </div>
  )
}

export default BentoCard
