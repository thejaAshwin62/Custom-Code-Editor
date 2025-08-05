"use client"

import { useState, useEffect } from "react"
import {
  RiSparklingLine,
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArrowLeftLine,
  RiCodeLine,
  RiTimeLine,
  RiUserLine,
} from "react-icons/ri"
import { useUser } from "@clerk/clerk-react"
import { supabase, TABLES } from "../lib/supabase"

const CodeTreasure = ({ theme, onBack }) => {
  const { user } = useUser()
  const [savedCodes, setSavedCodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [selectedCode, setSelectedCode] = useState(null)

  const languages = [
    { id: "all", name: "All Languages", icon: "🌐" },
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "css", name: "CSS", icon: "🎨" },
    { id: "json", name: "JSON", icon: "📋" },
  ]

  const loadCodes = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      let query = supabase
        .from(TABLES.USER_CODES)
        .select('*')
        .eq('user_id', user.id)

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }

      // Apply language filter
      if (filterLanguage !== "all") {
        query = query.eq('language', filterLanguage)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error

      setSavedCodes(data || [])
    } catch (error) {
      console.error("Error loading codes:", error)
      alert("Failed to load codes. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCode = async (codeId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from(TABLES.USER_CODES)
        .delete()
        .eq('id', codeId)
        .eq('user_id', user.id)

      if (error) throw error

      setSavedCodes((prev) => prev.filter((code) => code.id !== codeId))
    } catch (error) {
      console.error("Error deleting code:", error)
      alert("Failed to delete code. Please try again.")
    }
  }

  useEffect(() => {
    if (user) {
      loadCodes()
    }
  }, [user, searchTerm, sortBy, sortOrder, filterLanguage])

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center">
            <h1 className={`text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Code Treasure
            </h1>
            <p className={`text-lg mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Sign in to view your saved code treasures
            </p>
            <button
              onClick={onBack}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-200/70 border border-gray-300/50"
              }`}
            >
              <RiArrowLeftLine className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}>
      {/* Header */}
      <div className={`border-b ${theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50"
                }`}
              >
                <RiArrowLeftLine className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Code Treasure
                </h1>
                <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Discover your saved code gems
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                    : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                }`}
              >
                <RiSparklingLine className={`w-6 h-6 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <div className={`text-right ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                <div className="text-2xl font-bold">{savedCodes.length}</div>
                <div className="text-sm opacity-70">Saved Codes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <RiSearchLine className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-slate-400" : "text-gray-500"
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your code treasures..."
                className={`w-full pl-12 pr-4 py-4 rounded-xl border text-lg shadow-lg ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-purple-500/50"
                    : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white/70 focus:border-purple-500/50"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
              />
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className={`w-full px-4 py-4 rounded-xl border text-lg ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white focus:border-purple-500/50"
                  : "bg-white/50 border-gray-300/50 text-gray-900 focus:border-purple-500/50"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`flex-1 px-4 py-4 rounded-xl border text-lg ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white focus:border-purple-500/50"
                  : "bg-white/50 border-gray-300/50 text-gray-900 focus:border-purple-500/50"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
            >
              <option value="updated_at">Last Modified</option>
              <option value="created_at">Created Date</option>
              <option value="title">Title</option>
              <option value="language">Language</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-4 py-4 rounded-xl border text-lg font-medium transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-700/70"
                  : "bg-white/50 border-gray-300/50 text-gray-900 hover:bg-white/70"
              }`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Loading your code treasures...
            </p>
          </div>
        )}

        {/* Code Grid */}
        {!isLoading && (
          <>
            {savedCodes.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className={`w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-slate-700/50 border border-slate-600/50"
                      : "bg-gray-200/50 border border-gray-300/50"
                  }`}
                >
                  <RiCodeLine className={`w-12 h-12 ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  No code treasures yet
                </h3>
                <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Start coding and save your first snippet to see it here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer ${
                      theme === "dark"
                        ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 backdrop-blur-sm"
                        : "bg-white/50 border-gray-200/50 hover:bg-white/70 backdrop-blur-sm"
                    }`}
                    onClick={() => setSelectedCode(code)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {code.title}
                        </h3>
                        <p className={`text-sm mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          {code.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          theme === "dark"
                            ? "bg-slate-600/50 text-slate-300 border border-slate-500/50"
                            : "bg-gray-200/50 text-gray-700 border border-gray-300/50"
                        }`}
                      >
                        {code.language}
                      </span>
                    </div>

                    {/* Code Preview */}
                    <div className={`p-4 rounded-xl mb-4 ${
                      theme === "dark" ? "bg-slate-900/50 border border-slate-700/50" : "bg-gray-50/50 border border-gray-200/50"
                    }`}>
                      <pre className={`text-sm overflow-hidden ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                        {code.code.substring(0, 150)}
                        {code.code.length > 150 && "..."}
                      </pre>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className={`flex items-center space-x-1 ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}>
                        <RiTimeLine className="w-4 h-4" />
                        <span>{new Date(code.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}>
                        {code.code.length} chars
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-700/30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Load code into editor
                          window.location.href = '/?load=' + code.id
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                            : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20"
                        }`}
                      >
                        <RiEyeLine className="w-4 h-4" />
                        <span>Load</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCode(code.id)
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
                        }`}
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Code Detail Modal */}
      {selectedCode && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
            theme === "dark" ? "bg-black/80 backdrop-blur-sm" : "bg-slate-900/50 backdrop-blur-sm"
          }`}
          onClick={() => setSelectedCode(null)}
        >
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              theme === "dark" ? "bg-slate-800/95 border-slate-700/50" : "bg-white/95 border-gray-200/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {selectedCode.title}
                </h2>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {selectedCode.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedCode(null)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600"
                }`}
              >
                <RiArrowLeftLine className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    theme === "dark"
                      ? "bg-slate-600/50 text-slate-300 border border-slate-500/50"
                      : "bg-gray-200/50 text-gray-700 border border-gray-300/50"
                  }`}
                >
                  {selectedCode.language}
                </span>
                <div className={`flex items-center space-x-1 ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}>
                  <RiTimeLine className="w-4 h-4" />
                  <span>{new Date(selectedCode.updated_at).toLocaleDateString()}</span>
                </div>
                <div className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}>
                  {selectedCode.code.length} characters
                </div>
              </div>

              <div
                className={`p-6 rounded-xl border ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-700/50" : "bg-gray-50/50 border-gray-200/50"
                }`}
              >
                <pre className={`text-sm overflow-x-auto ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                  {selectedCode.code}
                </pre>
              </div>

              <div className="flex space-x-4 justify-end">
                <button
                  onClick={() => {
                    window.location.href = '/?load=' + selectedCode.id
                    setSelectedCode(null)
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                  }`}
                >
                  Load in Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeTreasure 