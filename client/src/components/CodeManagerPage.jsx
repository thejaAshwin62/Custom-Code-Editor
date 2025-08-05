"use client"

import { useState, useEffect } from "react"
import {
  RiSaveLine,
  RiFolderLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiTimeLine,
  RiCodeLine,
  RiRefreshLine,
  RiSearchLine,
  RiArrowLeftLine,
  RiAddLine,
} from "react-icons/ri"
import { useUser } from "@clerk/clerk-react"
import { supabase, TABLES } from "../lib/supabase"
import { toast } from "sonner"

const CodeManagerPage = ({ theme, onBack, onLoadCode, currentCode = "", currentLanguage = "javascript" }) => {
  const { user } = useUser()
  const [savedCodes, setSavedCodes] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [codeTitle, setCodeTitle] = useState("")
  const [codeDescription, setCodeDescription] = useState("")
  const [editingCode, setEditingCode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")

    const saveCode = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_CODES)
        .insert({
          title: codeTitle,
          description: codeDescription,
          code: currentCode || "", // Use current code from editor
          language: currentLanguage || "javascript",
          user_id: user.id, // Use Clerk user ID
        })
        .select()

      if (error) throw error

      setSavedCodes((prev) => [...prev, data[0]])
      setShowSaveModal(false)
      setCodeTitle("")
      setCodeDescription("")
      toast.success("Code saved successfully!")
    } catch (error) {
      console.error("Error saving code:", error)
      toast.error("Failed to save code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error

      setSavedCodes(data || [])
    } catch (error) {
      console.error("Error loading codes:", error)
      toast.error("Failed to load codes. Please try again.")
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
      toast.success("Code deleted successfully!")
    } catch (error) {
      console.error("Error deleting code:", error)
      toast.error("Failed to delete code. Please try again.")
    }
  }

  const updateCode = async (codeId, updatedData) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from(TABLES.USER_CODES)
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', codeId)
        .eq('user_id', user.id)
        .select()

      if (error) throw error

      setSavedCodes((prev) => prev.map((code) => (code.id === codeId ? data[0] : code)))
      setEditingCode(null)
      toast.success("Code updated successfully!")
    } catch (error) {
      console.error("Error updating code:", error)
      toast.error("Failed to update code. Please try again.")
    }
  }

  useEffect(() => {
    if (user) {
      loadCodes()
    }
  }, [user, searchTerm, sortBy, sortOrder])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className={`p-8 rounded-2xl border backdrop-blur-sm max-w-md w-full ${
            theme === "dark" ? "bg-slate-800/50 border-slate-700/50" : "bg-gray-50/50 border-gray-200/50"
          }`}
        >
          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                theme === "dark"
                  ? "bg-slate-700/50 border border-slate-600/50"
                  : "bg-gray-200/50 border border-gray-300/50"
              }`}
            >
              <RiFolderLine className={`w-8 h-8 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Code Manager
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
              Sign in to save and manage your code snippets
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`border-b backdrop-blur-xl flex-shrink-0 ${
          theme === "dark"
            ? "bg-slate-900/95 border-slate-700/50 shadow-2xl shadow-slate-900/50"
            : "bg-white/95 border-gray-200/50 shadow-2xl shadow-gray-900/10"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-lg"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-lg"
              }`}
              title="Back to Editor"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            <div
              className={`p-4 rounded-2xl ${
                theme === "dark"
                  ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
              }`}
            >
              <RiFolderLine className={`w-8 h-8 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Code Manager
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-500/20"
                  }`}
                >
                  {savedCodes.length} saved snippets
                </div>
                {currentCode && currentCode.trim() && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30"
                        : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 border border-green-500/20"
                    }`}
                  >
                    Editor code available
                  </div>
                )}
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    theme === "dark"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentCode && currentCode.trim() && (
              <button
                onClick={() => {
                  setCodeTitle(`Code Snippet ${new Date().toLocaleString()}`)
                  setCodeDescription("Code from editor")
                  setShowSaveModal(true)
                }}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 shadow-green-500/10"
                    : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/20 shadow-green-500/10"
                }`}
              >
                <RiSaveLine className="w-5 h-5" />
                <span>Save Current Code</span>
              </button>
            )}
            <button
              onClick={() => setShowSaveModal(true)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                theme === "dark"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-green-500/20 border border-emerald-500/20 shadow-emerald-500/10"
              }`}
            >
              <RiAddLine className="w-5 h-5" />
              <span>New Snippet</span>
            </button>
            <button
              onClick={loadCodes}
              disabled={isLoading}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 shadow-blue-500/10"
                  : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 shadow-blue-500/10"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RiRefreshLine className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Search and Sort Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <RiSearchLine className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === "dark" ? "text-slate-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search codes by title, description, or content..."
              className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm shadow-lg ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                  : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white/70 focus:border-emerald-500/50"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300`}
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600/50 text-white focus:border-emerald-500/50"
                    : "bg-white/50 border-gray-300/50 text-gray-900 focus:border-emerald-500/50"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300`}
              >
                <option value="updated_at">Last Modified</option>
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
                <option value="language">Language</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-700/70"
                  : "bg-white/50 border-gray-300/50 text-gray-900 hover:bg-white/70"
              }`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Enhanced Saved Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCodes.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div
                className={`w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-slate-700/50 border border-slate-600/50"
                    : "bg-gray-200/50 border border-gray-300/50"
                }`}
              >
                <RiCodeLine className={`w-12 h-12 ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                No saved codes yet
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                Save your first code snippet to get started
              </p>
              <button
                onClick={() => setShowSaveModal(true)}
                className={`mt-6 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/30 shadow-emerald-500/10"
                    : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-green-500/20 border border-emerald-500/20 shadow-emerald-500/10"
                }`}
              >
                <RiAddLine className="w-5 h-5" />
                <span>Create First Snippet</span>
              </button>
            </div>
          ) : (
            savedCodes.map((savedCode) => (
              <div
                key={savedCode.id}
                className={`p-6 rounded-2xl border transition-all duration-300 shadow-lg hover:shadow-xl ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70 backdrop-blur-sm"
                    : "bg-white/50 border-gray-200/50 hover:bg-gray-100/70 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {savedCode.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          theme === "dark"
                            ? "bg-slate-600/50 text-slate-300 border border-slate-500/50"
                            : "bg-gray-200/50 text-gray-700 border border-gray-300/50"
                        }`}
                      >
                        {savedCode.language}
                      </span>
                    </div>
                    <p className={`text-sm mb-4 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                      {savedCode.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs mb-4">
                      <div
                        className={`flex items-center space-x-1 ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}
                      >
                        <RiTimeLine className="w-3 h-3" />
                        <span>{new Date(savedCode.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-gray-500"}`}>
                        {savedCode.code.length} characters
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code Preview */}
                <div className={`mb-4 p-3 rounded-lg ${
                  theme === "dark" ? "bg-slate-900/30 border border-slate-700/30" : "bg-gray-100/50 border border-gray-200/30"
                }`}>
                  <pre className={`text-xs overflow-hidden ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                    {savedCode.code.substring(0, 150)}
                    {savedCode.code.length > 150 && "..."}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onLoadCode(savedCode.code)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark"
                        ? "hover:bg-slate-600/50 text-blue-400 border border-blue-500/30"
                        : "hover:bg-gray-200/50 text-blue-600 border border-blue-500/20"
                    }`}
                    title="Load code"
                  >
                    <RiEyeLine className="w-4 h-4" />
                    <span className="text-xs">Load</span>
                  </button>
                  <button
                    onClick={() => setEditingCode(savedCode)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark"
                        ? "hover:bg-slate-600/50 text-yellow-400 border border-yellow-500/30"
                        : "hover:bg-gray-200/50 text-yellow-600 border border-yellow-500/20"
                    }`}
                    title="Edit"
                  >
                    <RiEditLine className="w-4 h-4" />
                    <span className="text-xs">Edit</span>
                  </button>
                  <button
                    onClick={() => deleteCode(savedCode.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark"
                        ? "hover:bg-slate-600/50 text-red-400 border border-red-500/30"
                        : "hover:bg-gray-200/50 text-red-600 border border-red-500/20"
                    }`}
                    title="Delete"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                    <span className="text-xs">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Save Modal */}
      {showSaveModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
            theme === "dark" ? "bg-black/80 backdrop-blur-sm" : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              theme === "dark" ? "bg-slate-800/95 border-slate-700/50" : "bg-white/95 border-gray-200/50"
            }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`p-3 rounded-xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
                    : "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
                }`}
              >
                <RiSaveLine className={`w-6 h-6 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                  Save Code Snippet
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                  Give your code a title and description
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={codeTitle}
                  onChange={(e) => setCodeTitle(e.target.value)}
                  className={`w-full p-4 rounded-xl border text-sm shadow-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                      : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-emerald-500/50"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300`}
                  placeholder="Enter a descriptive title for your code"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
                >
                  Description
                </label>
                <textarea
                  value={codeDescription}
                  onChange={(e) => setCodeDescription(e.target.value)}
                  className={`w-full p-4 rounded-xl border text-sm resize-none shadow-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                      : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-emerald-500/50"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300`}
                  placeholder="Describe what this code does and any important notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-4 justify-end mt-8">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-200/70 border border-gray-300/50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={saveCode}
                disabled={!codeTitle.trim() || isLoading}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  !codeTitle.trim() || isLoading
                    ? theme === "dark"
                      ? "bg-emerald-800/50 text-emerald-300/50 cursor-not-allowed border border-emerald-700/50"
                      : "bg-emerald-300/50 text-emerald-700/50 cursor-not-allowed border border-emerald-400/50"
                    : theme === "dark"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-500/25"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-500/25"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  "Save Code"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editingCode && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
            theme === "dark" ? "bg-black/80 backdrop-blur-sm" : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              theme === "dark" ? "bg-slate-800/95 border-slate-700/50" : "bg-white/95 border-gray-200/50"
            }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`p-3 rounded-xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30"
                    : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20"
                }`}
              >
                <RiEditLine className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                  Edit Code Snippet
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                  Update the title and description
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={editingCode.title}
                  onChange={(e) => setEditingCode({ ...editingCode, title: e.target.value })}
                  className={`w-full p-4 rounded-xl border text-sm shadow-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-blue-500/50"
                      : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-blue-500/50"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
                >
                  Description
                </label>
                <textarea
                  value={editingCode.description}
                  onChange={(e) => setEditingCode({ ...editingCode, description: e.target.value })}
                  className={`w-full p-4 rounded-xl border text-sm resize-none shadow-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-blue-500/50"
                      : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-blue-500/50"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300`}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-4 justify-end mt-8">
              <button
                onClick={() => setEditingCode(null)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-200/70 border border-gray-300/50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateCode(editingCode.id, {
                    title: editingCode.title,
                    description: editingCode.description,
                  })
                }
                disabled={!editingCode.title.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  !editingCode.title.trim()
                    ? theme === "dark"
                      ? "bg-blue-800/50 text-blue-300/50 cursor-not-allowed border border-blue-700/50"
                      : "bg-blue-300/50 text-blue-700/50 cursor-not-allowed border border-blue-400/50"
                    : theme === "dark"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                }`}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeManagerPage 