"use client"

import { useState, useEffect } from "react"
import {
  RiSunLine,
  RiMoonLine,
  RiCodeLine,
  RiSparklingLine,
  RiFlashlightFill,
  RiCloseLine,
  RiSendPlaneLine,
  RiUserLine,
  RiRobotLine,
  RiMenuLine,
  RiShutDownLine,
  RiFullscreenLine,
  RiHomeLine,
  RiFolderLine,
  RiSaveLine,
} from "react-icons/ri"
import axios from "axios"
import { supabase, TABLES } from "./lib/supabase"
import { ROUTES } from "./routes"
import CodeEditor from "./components/CodeEditor"
import CodeManager from "./components/CodeManager"
import CodeManagerPage from "./components/CodeManagerPage"
import HomePage from "./components/HomePage"
import CodeTreasure from "./components/CodeTreasure"
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from "@clerk/clerk-react"
import { toast } from "sonner"

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5000"

function App() {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark"
  })

  const [code, setCode] = useState(() => {
    return (
      localStorage.getItem("code") ||
      `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
    )
  })

  const [language, setLanguage] = useState("javascript")
  const [isExplaining, setIsExplaining] = useState(false)
  const [explanation, setExplanation] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [activePanel, setActivePanel] = useState("explanation")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentRoute, setCurrentRoute] = useState(ROUTES.HOME)

  useEffect(() => {
    localStorage.setItem("theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem("code", code)
  }, [code])

  // Show welcome toast when user signs in
  useEffect(() => {
    if (user) {
      toast.success(`Welcome back, ${user.firstName || user.username || 'User'}!`)
    }
  }, [user])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleAiAssistant = () => {
    setAiAssistantEnabled(!aiAssistantEnabled)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleGetStarted = () => {
    setCurrentRoute(ROUTES.EDITOR)
  }

  const handleGoHome = () => {
    setCurrentRoute(ROUTES.HOME)
  }

  const handleShowCodeTreasure = () => {
    setCurrentRoute(ROUTES.CODE_TREASURE)
  }

  const handleBackFromTreasure = () => {
    setCurrentRoute(ROUTES.HOME)
  }

  const handleShowCodeManager = () => {
    if (!user) {
      toast.error("Please sign in to access your saved codes!", {
        action: {
          label: "Sign In",
          onClick: () => openSignIn()
        }
      })
      return
    }
    setCurrentRoute(ROUTES.CODE_MANAGER)
  }

  const handleBackFromCodeManager = () => {
    setCurrentRoute(ROUTES.EDITOR)
  }

  // Function to animate typing code into the editor
  const animateTypingCode = async (codeToType, editorRef) => {
    if (!editorRef || !editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()

    if (!model) {
      setCode(codeToType)
      return
    }

    model.setValue("")
    const tokens = codeToType.match(/[\w]+|[^\w\s]|\s+/g) || []
    let currentText = ""
    const baseDelay = 30
    const variationFactor = 0.5

    for (let i = 0; i < tokens.length; i++) {
      currentText += tokens[i]
      model.setValue(currentText)
      editor.focus()
      editor.revealPositionInCenter({
        lineNumber: model.getLineCount(),
        column: model.getLineMaxColumn(model.getLineCount()),
      })

      const randomVariation = 1 - variationFactor / 2 + Math.random() * variationFactor
      const delay = baseDelay * randomVariation * (tokens[i].length || 1)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    setCode(codeToType)
  }

  const handleExplainCode = async () => {
    if (!code.trim() || !aiAssistantEnabled) return

    setIsExplaining(true)
    setActivePanel("explanation")
    setExplanation("")

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Explain this code",
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    try {
      const response = await axios.post("/explain", { code })
      setExplanation(response.data.explanation)

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.explanation,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error explaining code:", error)
      setExplanation("Sorry, I couldn't explain this code right now. Please try again.")
      toast.error("Failed to explain code. Please try again.")
    } finally {
      setIsExplaining(false)
    }
  }

  const handleAutocomplete = async () => {
    if (!code.trim() || !aiAssistantEnabled) return

    setActivePanel("suggestions")
    setSuggestions([])

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Suggest improvements for this code",
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    try {
      const response = await axios.post("/autocomplete", { code })
      const suggestion = response.data.suggestion

      setSuggestions([
        {
          code: suggestion,
          description: "AI-generated code suggestion",
        },
      ])

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Here's a suggested improvement:\n\n\`\`\`${language}\n${suggestion}\n\`\`\``,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting autocomplete:", error)
      setSuggestions([
        {
          code: "// Unable to generate suggestion at this time",
          description: "Error generating suggestion",
        },
      ])
      toast.error("Failed to generate code suggestions. Please try again.")
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !aiAssistantEnabled) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsTyping(true)

    try {
      const isCodeModRequest =
        chatInput.toLowerCase().includes("change") ||
        chatInput.toLowerCase().includes("add") ||
        chatInput.toLowerCase().includes("modify") ||
        chatInput.toLowerCase().includes("update") ||
        chatInput.toLowerCase().includes("create") ||
        chatInput.toLowerCase().includes("implement") ||
        chatInput.toLowerCase().includes("fix") ||
        chatInput.toLowerCase().includes("code")

      if (isCodeModRequest) {
        const response = await axios.post("/chat-code-modification", {
          message: chatInput,
          currentCode: code,
          language: language,
        })

        if (response.data.unchanged) {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.message || "No changes were needed for this code. Try being more specific in your request.",
            timestamp: new Date(),
          }
          setChatMessages((prev) => [...prev, aiMessage])
        } else {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.explanation ||
              "I've updated your code based on your request. Here's what I did:\n\n" +
                `\`\`\`${language}\n${response.data.modifiedCode}\n\`\`\``,
            timestamp: new Date(),
          }
          setChatMessages((prev) => [...prev, aiMessage])

          const codeEditorComponent = document.querySelector(".monaco-editor")
          if (codeEditorComponent && window.monaco) {
            const editor = window.monaco.editor.getEditors()[0]
            if (editor) {
              await animateTypingCode(response.data.modifiedCode, {
                current: editor,
              })
            } else {
              setCode(response.data.modifiedCode)
            }
          } else {
            setCode(response.data.modifiedCode)
          }
        }
      } else {
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `I understand you're asking about: "${chatInput}". I can help modify your code, explain it, or suggest improvements. Try asking me to add a feature or change something specific in your code.`,
            timestamp: new Date(),
          }
          setChatMessages((prev) => [...prev, aiMessage])
        }, 1000)
      }
    } catch (error) {
      console.error("Error handling chat request:", error)
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
      toast.error("Failed to process chat request. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleLoadCode = (loadedCode) => {
    setCode(loadedCode)
    // Navigate back to editor when code is loaded
    setCurrentRoute(ROUTES.EDITOR)
    toast.success("Code loaded successfully!")
  }

  const handleQuickSave = async () => {
    if (!code.trim()) return

    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to save your code!", {
        action: {
          label: "Sign In",
          onClick: () => openSignIn()
        }
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.USER_CODES)
        .insert({
          title: `Code Snippet ${new Date().toLocaleString()}`,
          description: "Quick saved code snippet",
          code: code,
          language: language,
          user_id: user.id, // Use Clerk user ID
        })
        .select()

      if (error) throw error

      // Show success message
      toast.success("Code saved successfully!")
    } catch (error) {
      console.error("Error saving code:", error)
      toast.error("Failed to save code. Please try again.")
    }
  }

  // Route-based rendering
  if (currentRoute === ROUTES.CODE_MANAGER) {
    return (
      <CodeManagerPage 
        theme={theme} 
        onBack={handleBackFromCodeManager} 
        onLoadCode={handleLoadCode}
        currentCode={code}
        currentLanguage={language}
      />
    )
  }

  if (currentRoute === ROUTES.CODE_TREASURE) {
    return (
      <CodeTreasure theme={theme} onBack={handleBackFromTreasure} />
    )
  }

  // Show HomePage only when on home route
  if (currentRoute === ROUTES.HOME) {
    return (
      <div className="w-full overflow-auto">
        {/* Theme Toggle for Homepage */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-xl border ${
              theme === "dark"
                ? "bg-slate-800/80 hover:bg-slate-800 text-yellow-400 border-slate-700/50 hover:border-slate-600/70 shadow-lg"
                : "bg-white/80 hover:bg-white text-orange-500 border-gray-200/50 hover:border-gray-300/70 shadow-lg"
            }`}
            title="Toggle Theme"
          >
            {theme === "dark" ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
          </button>
        </div>

        <HomePage theme={theme} onGetStarted={handleGetStarted} onShowCodeTreasure={handleShowCodeTreasure} />
        
        {/* Additional button to go to editor for all users */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleGetStarted}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-xl border ${
              theme === "dark"
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/20 hover:border-emerald-500/40 shadow-lg shadow-emerald-500/10"
            }`}
            title="Go to Code Editor"
          >
            <RiCodeLine className="w-6 h-6" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
          }`}
        />
        <div className="absolute inset-0">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                theme === "dark" ? "bg-emerald-400/20" : "bg-blue-400/20"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>



      {/* Main app UI */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Enhanced Header */}
        <header
          className={`border-b backdrop-blur-xl flex-shrink-0 ${
            theme === "dark"
              ? "bg-slate-900/95 border-slate-700/50 shadow-2xl shadow-slate-900/50"
              : "bg-white/95 border-gray-200/50 shadow-2xl shadow-gray-900/10"
          }`}
        >
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center space-x-6">
              <div
                className={`p-4 rounded-2xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                }`}
              >
                <RiCodeLine className={`w-8 h-8 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  AI Code Studio Pro
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-500/20"
                    }`}
                  >
                    Powered by Gemini AI
                  </div>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      aiAssistantEnabled
                        ? theme === "dark"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-500/10 text-emerald-600"
                        : theme === "dark"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        aiAssistantEnabled ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                      }`}
                    />
                    <span>{aiAssistantEnabled ? "AI Active" : "AI Offline"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGoHome}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentRoute === ROUTES.HOME
                      ? theme === "dark"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : theme === "dark"
                        ? "hover:bg-slate-700/50 text-slate-300 border border-slate-600/50"
                        : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50"
                  }`}
                >
                  <RiHomeLine className="w-4 h-4" />
                  <span className="text-sm font-medium">Home</span>
                </button>
                
                {currentRoute !== ROUTES.HOME && (
                  <>
                    <span className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>/</span>
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {currentRoute === ROUTES.EDITOR && "Code Editor"}
                      {currentRoute === ROUTES.CODE_MANAGER && "Code Manager"}
                      {currentRoute === ROUTES.CODE_TREASURE && "Code Treasure"}
                    </span>
                  </>
                )}
              </div>

              {/* Code Manager Button */}
              <button
                onClick={handleShowCodeManager}
                className={`flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  user
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 shadow-blue-500/10"
                      : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 shadow-blue-500/10"
                    : theme === "dark"
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 shadow-orange-500/10"
                      : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 shadow-orange-500/10"
                }`}
                title={!user ? "Sign in to access Code Manager" : "Open Code Manager"}
              >
                <RiFolderLine className="w-5 h-5" />
                <span className="font-medium">{user ? "Code Manager" : "Sign in for Code Manager"}</span>
              </button>

              {/* Enhanced Control Buttons */}
              <button
                onClick={toggleAiAssistant}
                className={`flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  aiAssistantEnabled
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30 shadow-lg shadow-emerald-500/10"
                      : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-green-500/20 shadow-lg shadow-emerald-500/10"
                    : theme === "dark"
                      ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/70"
                      : "bg-gray-200/50 text-gray-500 border border-gray-300/50 hover:bg-gray-200/70"
                }`}
              >
                <RiShutDownLine className="w-5 h-5" />
                <span className="font-medium">{aiAssistantEnabled ? "AI Enabled" : "AI Disabled"}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-lg"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-lg"
                }`}
                title="Toggle Fullscreen"
              >
                <RiFullscreenLine className="w-5 h-5" />
              </button>

              <button
                onClick={toggleSidebar}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-lg"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-lg"
                }`}
                title="Toggle AI Sidebar"
              >
                <RiMenuLine className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                    : "bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-500 border border-orange-500/30 shadow-lg shadow-orange-500/10"
                }`}
                title="Toggle Theme"
              >
                {theme === "dark" ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content with Enhanced Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Code Editor - Left Side with Enhanced Styling */}
          <div
            className={`main-content flex-1 flex flex-col transition-all duration-700 ease-in-out ${
              sidebarOpen ? "mr-96" : "mr-20"
            }`}
          >
            <div className="flex-1 p-4">
              <div
                className={`h-full rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-700/50 shadow-slate-900/50"
                    : "bg-white/50 border-gray-200/50 shadow-gray-900/10"
                }`}
              >
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  theme={theme}
                  onExplain={handleExplainCode}
                  onAutocomplete={handleAutocomplete}
                  aiAssistantEnabled={aiAssistantEnabled}
                />
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleQuickSave}
                    disabled={!code.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      code.trim()
                        ? user
                          ? theme === "dark"
                            ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/30 shadow-emerald-500/10"
                            : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-green-500/20 border border-emerald-500/20 shadow-emerald-500/10"
                          : theme === "dark"
                            ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 shadow-orange-500/10"
                            : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 shadow-orange-500/10"
                        : theme === "dark"
                          ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                          : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
                    }`}
                    title={!user ? "Sign in to save your code" : "Save code to your account"}
                  >
                    <RiSaveLine className="w-4 h-4" />
                    <span>{user ? "Quick Save" : "Sign in to Save"}</span>
                  </button>
                </div>
                <div className="text-xs opacity-70">
                  {code.length} characters
                </div>
              </div>
            </div>

            {/* Code Manager Access Button */}
            <div className="p-4 pt-0">
              <button
                onClick={handleShowCodeManager}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  user
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-blue-500/30 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/10"
                      : "bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-blue-500/20 border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/10"
                    : theme === "dark"
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30 hover:border-orange-500/50 shadow-orange-500/10"
                      : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border-orange-500/20 hover:border-orange-500/40 shadow-orange-500/10"
                }`}
                title={!user ? "Sign in to access your saved codes" : "View your saved codes"}
              >
                <RiFolderLine className="w-6 h-6" />
                <span className="font-medium text-lg">{user ? "Open Code Manager" : "Sign in for Code Manager"}</span>
              </button>
            </div>
          </div>

          {/* Enhanced AI Sidebar - Right Side */}
          <div
            className={`sidebar-container fixed top-0 right-0 h-full w-96 min-w-96 border-l flex flex-col flex-shrink-0 z-20 ${
              theme === "dark"
                ? "bg-gradient-to-b from-slate-900/98 to-slate-950/98 border-slate-700/50 backdrop-blur-2xl shadow-2xl shadow-slate-900/50"
                : "bg-gradient-to-b from-white/98 to-gray-50/98 border-gray-200/50 backdrop-blur-2xl shadow-2xl shadow-gray-900/20"
            } ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
          >
            {/* Enhanced Sidebar Header */}
            <div
              className={`flex flex-col p-8 border-b flex-shrink-0 ${
                theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
              }`}
            >
              {/* AI Assistant Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                        : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                    }`}
                  >
                    <RiRobotLine className={`w-6 h-6 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-xl font-bold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      AI Assistant
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          aiAssistantEnabled ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                        }`}
                      />
                      <span className={`text-sm truncate ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                        {aiAssistantEnabled ? "Online & Ready" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 ml-4 ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-gray-400 hover:text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-lg"
                      : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-lg"
                  }`}
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Section */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-xl border ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-600/50 text-white"
                    : "bg-white/50 border-gray-200/50 text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                        : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                    }`}
                  >
                    <RiUserLine className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{user?.firstName || "User"}</span>
                    <span className="text-xs opacity-70 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {chatMessages.length === 0 ? (
                <div className="text-center py-16">
                  <div
                    className={`w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 shadow-xl"
                        : "bg-gradient-to-br from-gray-100/50 to-gray-200/50 border border-gray-300/50 shadow-xl"
                    }`}
                  >
                    <RiRobotLine className={`w-10 h-10 ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Welcome to AI Assistant
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    Start a conversation with your intelligent coding companion
                  </p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "ai" && (
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg"
                            : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg"
                        }`}
                      >
                        <RiRobotLine className="w-6 h-6 text-emerald-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                        message.type === "user"
                          ? theme === "dark"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25"
                          : theme === "dark"
                            ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-gray-200 border border-slate-600/50 backdrop-blur-sm shadow-slate-900/25"
                            : "bg-gradient-to-br from-white/80 to-gray-50/80 text-gray-900 border border-gray-200/50 backdrop-blur-sm shadow-gray-900/10"
                      }`}
                    >
                      <pre
                        className={`whitespace-pre-wrap text-sm leading-relaxed ${
                          message.type === "user" ? "text-white" : theme === "dark" ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {message.content}
                      </pre>
                      <div
                        className={`text-xs mt-2 opacity-70 ${
                          message.type === "user"
                            ? "text-blue-100"
                            : theme === "dark"
                              ? "text-slate-400"
                              : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.type === "user" && (
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-slate-600/80 to-slate-700/80 border border-slate-500/50 shadow-lg"
                            : "bg-gradient-to-br from-gray-200/80 to-gray-300/80 border border-gray-400/50 shadow-lg"
                        }`}
                      >
                        <RiUserLine className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex space-x-4 justify-start">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg"
                        : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg"
                    }`}
                  >
                    <RiRobotLine className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 backdrop-blur-sm"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50 backdrop-blur-sm"
                    }`}
                  >
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" />
                      <div
                        className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Chat Input */}
            <div
              className={`p-8 border-t flex-shrink-0 ${
                theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
              }`}
            >
              <form onSubmit={handleChatSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about your code..."
                  disabled={!aiAssistantEnabled}
                  className={`flex-1 px-6 py-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 shadow-lg ${
                    theme === "dark"
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:bg-slate-700/70 focus:border-emerald-500/50 shadow-slate-900/25"
                      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white/70 focus:border-emerald-500/50 shadow-gray-900/10"
                  } ${!aiAssistantEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping || !aiAssistantEnabled}
                  className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    chatInput.trim() && !isTyping && aiAssistantEnabled
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
                      : theme === "dark"
                        ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                        : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
                  }`}
                >
                  <RiSendPlaneLine className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Enhanced Quick Actions Panel (when sidebar is closed) */}
          <div
            className={`quick-actions-container fixed top-0 right-0 h-full w-20 min-w-20 border-l flex flex-col items-center py-8 space-y-6 flex-shrink-0 z-20 ${
              theme === "dark"
                ? "bg-gradient-to-b from-slate-900/98 to-slate-950/98 border-slate-700/50 backdrop-blur-2xl shadow-2xl shadow-slate-900/50"
                : "bg-gradient-to-b from-white/98 to-gray-50/98 border-gray-200/50 backdrop-blur-2xl shadow-2xl shadow-gray-900/20"
            } ${!sidebarOpen ? "quick-actions-open" : "quick-actions-closed"}`}
          >
            <button
              onClick={toggleSidebar}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                theme === "dark"
                  ? "hover:bg-slate-700/50 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-slate-900/25"
                  : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-gray-900/10"
              }`}
              title="Open AI Assistant"
            >
              <RiRobotLine className="w-6 h-6" />
            </button>
            <button
              onClick={handleShowCodeManager}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                user
                  ? theme === "dark"
                    ? "hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 shadow-blue-500/10"
                    : "hover:bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/10"
                  : theme === "dark"
                    ? "hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 shadow-orange-500/10"
                    : "hover:bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:border-orange-500/40 shadow-orange-500/10"
              }`}
              title={!user ? "Sign in to access Code Manager" : "Code Manager"}
            >
              <RiFolderLine className="w-6 h-6" />
            </button>
            <button
              onClick={handleExplainCode}
              disabled={!aiAssistantEnabled}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                theme === "dark"
                  ? aiAssistantEnabled
                    ? "hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/10"
                    : "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                  : aiAssistantEnabled
                    ? "hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/10"
                    : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
              }`}
              title="Explain Code"
            >
              <RiSparklingLine className="w-6 h-6" />
            </button>
            <button
              onClick={handleAutocomplete}
              disabled={!aiAssistantEnabled}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                theme === "dark"
                  ? aiAssistantEnabled
                    ? "hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 shadow-purple-500/10"
                    : "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                  : aiAssistantEnabled
                    ? "hover:bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:border-purple-500/40 shadow-purple-500/10"
                    : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
              }`}
              title="Get Suggestions"
            >
              <RiFlashlightFill className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-open {
          transform: translateX(0);
          opacity: 1;
        }
        .sidebar-closed {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }
        .quick-actions-open {
          transform: translateX(0);
          opacity: 1;
        }
        .quick-actions-closed {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }
        .smooth-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .smooth-button:hover {
          transform: translateY(-1px);
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
      `}</style>
    </div>
  )
}

export default App
