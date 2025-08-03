"use client";

import { RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import { useState } from "react";

const AIAutocomplete = ({
  suggestions,
  theme,
  isActive,
  onActivate,
  onApplySuggestion,
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleApplySuggestion = (code) => {
    onApplySuggestion(code);
    setCopiedIndex(suggestions.findIndex((s) => s.code === code));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className={`h-full cursor-pointer transition-all duration-200 flex flex-col ${
        isActive ? "ring-2 ring-purple-500/50" : ""
      }`}
      onClick={onActivate}
    >
      {suggestions.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p
                  className={`text-sm font-medium pr-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {suggestion.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplySuggestion(suggestion.code);
                  }}
                  className={`p-1 rounded transition-colors flex-shrink-0 ${
                    theme === "dark"
                      ? "hover:bg-slate-600 text-purple-400"
                      : "hover:bg-gray-200 text-indigo-600"
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
                    ? "bg-slate-800 border-slate-600 text-gray-300"
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
              theme === "dark" ? "bg-purple-500/20" : "bg-indigo-500/20"
            }`}
          >
            <span
              className={`text-2xl ${
                theme === "dark" ? "text-purple-400" : "text-indigo-600"
              }`}
            >
              ✨
            </span>
          </div>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Click "Suggest" to get AI-powered code improvements
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAutocomplete;
