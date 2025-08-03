"use client";

import { useState } from "react";

const BentoCard = ({ title, icon, children, theme, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-sm
        transition-all duration-200 ease-out flex flex-col
        ${
          theme === "dark"
            ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
            : "bg-white/70 border-gray-200/50 hover:bg-white/90"
        }
        ${isHovered ? "shadow-2xl" : "shadow-lg"}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass effect overlay */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-br from-emerald-500/5 to-transparent"
            : "bg-gradient-to-br from-blue-500/5 to-transparent"
        }`}
      />

      {/* Header */}
      <div
        className={`relative z-10 px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 ${
          theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              theme === "dark" ? "bg-emerald-500/20" : "bg-blue-500/20"
            }`}
          >
            <div
              className={
                theme === "dark" ? "text-emerald-400" : "text-blue-600"
              }
            >
              {icon}
            </div>
          </div>
          <h3
            className={`font-semibold text-sm sm:text-base ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 flex-1 overflow-hidden min-h-0">
        {children}
      </div>
    </div>
  );
};

export default BentoCard;
