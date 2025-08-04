"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/ri";
import axios from "axios";
import CodeEditor from "./components/CodeEditor";
import AIExplanation from "./components/AIExplanation";
import AIAutocomplete from "./components/AIAutocomplete";
import CodeRunner from "./components/CodeRunner";
import BentoCard from "./components/BentoCard";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [code, setCode] = useState(() => {
    return (
      localStorage.getItem("code") ||
      `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
    );
  });

  const [language, setLanguage] = useState("javascript");
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activePanel, setActivePanel] = useState("explanation");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAiAssistant = () => {
    setAiAssistantEnabled(!aiAssistantEnabled);
  };

  // Function to animate typing code into the editor
  const animateTypingCode = async (codeToType, editorRef) => {
    if (!editorRef || !editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();

    // If we can't get the model, fallback to normal code update
    if (!model) {
      setCode(codeToType);
      return;
    }

    // Clear the editor
    model.setValue("");

    // Split the code by words and special characters to create a more natural typing effect
    const tokens = codeToType.match(/[\w]+|[^\w\s]|\s+/g) || [];
    let currentText = "";

    // Animation speed configuration
    const baseDelay = 30; // milliseconds between characters
    const variationFactor = 0.5; // randomness in typing speed

    // Create a "typing" effect by progressively adding tokens
    for (let i = 0; i < tokens.length; i++) {
      // Add the current token
      currentText += tokens[i];

      // Update the editor
      model.setValue(currentText);

      // Focus the editor and scroll to the insertion point
      editor.focus();
      editor.revealPositionInCenter({
        lineNumber: model.getLineCount(),
        column: model.getLineMaxColumn(model.getLineCount()),
      });

      // Calculate a slightly random delay to make typing feel more natural
      const randomVariation =
        1 - variationFactor / 2 + Math.random() * variationFactor;
      const delay = baseDelay * randomVariation * (tokens[i].length || 1);

      // Pause before the next token
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Make sure our React state is updated with the final code
    setCode(codeToType);
  };

  const handleExplainCode = async () => {
    if (!code.trim() || !aiAssistantEnabled) return;

    setIsExplaining(true);
    setActivePanel("explanation");
    setExplanation("");

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Explain this code",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("/explain", { code });
      setExplanation(response.data.explanation);

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.explanation,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error explaining code:", error);
      setExplanation(
        "Sorry, I couldn't explain this code right now. Please try again."
      );
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAutocomplete = async () => {
    if (!code.trim() || !aiAssistantEnabled) return;

    setActivePanel("suggestions");
    setSuggestions([]);

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Suggest improvements for this code",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("/autocomplete", { code });
      const suggestion = response.data.suggestion;

      // Format the suggestion for display
      setSuggestions([
        {
          code: suggestion,
          description: "AI-generated code suggestion",
        },
      ]);

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Here's a suggested improvement:\n\n\`\`\`${language}\n${suggestion}\n\`\`\``,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting autocomplete:", error);
      setSuggestions([
        {
          code: "// Unable to generate suggestion at this time",
          description: "Error generating suggestion",
        },
      ]);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !aiAssistantEnabled) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Check if the message appears to be a code modification request
      const isCodeModRequest =
        chatInput.toLowerCase().includes("change") ||
        chatInput.toLowerCase().includes("add") ||
        chatInput.toLowerCase().includes("modify") ||
        chatInput.toLowerCase().includes("update") ||
        chatInput.toLowerCase().includes("create") ||
        chatInput.toLowerCase().includes("implement") ||
        chatInput.toLowerCase().includes("fix") ||
        chatInput.toLowerCase().includes("code");

      if (isCodeModRequest) {
        // This appears to be a code modification request
        const response = await axios.post("/chat-code-modification", {
          message: chatInput,
          currentCode: code,
          language: language,
        });

        if (response.data.unchanged) {
          // If no changes were made, just notify the user
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.message ||
              "No changes were needed for this code. Try being more specific in your request.",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        } else {
          // Create AI response message first (before animation starts)
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.explanation ||
              "I've updated your code based on your request. Here's what I did:\n\n" +
                `\`\`\`${language}\n${response.data.modifiedCode}\n\`\`\``,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);

          // Find the code editor reference through DOM
          const codeEditorComponent = document.querySelector(".monaco-editor");
          if (codeEditorComponent && window.monaco) {
            const editor = window.monaco.editor.getEditors()[0];
            if (editor) {
              // Animate the code typing
              await animateTypingCode(response.data.modifiedCode, {
                current: editor,
              });
            } else {
              // Fallback if we can't get the editor
              setCode(response.data.modifiedCode);
            }
          } else {
            // Fallback if we can't find the editor
            setCode(response.data.modifiedCode);
          }
        }
      } else {
        // For normal chat messages
        // Use the generateText function via a new endpoint or reuse existing one
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `I understand you're asking about: "${chatInput}". I can help modify your code, explain it, or suggest improvements. Try asking me to add a feature or change something specific in your code.`,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling chat request:", error);
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "Sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col transition-all duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b backdrop-blur-xl flex-shrink-0 ${
          theme === "dark"
            ? "bg-slate-800/80 border-slate-700/50 shadow-lg shadow-slate-900/20"
            : "bg-white/80 border-gray-200/50 shadow-lg shadow-gray-900/10"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-xl ${
                theme === "dark"
                  ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                  : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
              }`}
            >
              <RiCodeLine
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <h1
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                AI Code Studio
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-500/20"
                }`}
              >
                Powered by Gemini
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Assistant Toggle */}
            <button
              onClick={toggleAiAssistant}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                aiAssistantEnabled
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30"
                    : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-green-500/20"
                  : theme === "dark"
                  ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/70"
                  : "bg-gray-200/50 text-gray-500 border border-gray-300/50 hover:bg-gray-200/70"
              }`}
            >
              <RiShutDownLine
                className={`w-4 h-4 ${
                  aiAssistantEnabled ? "text-emerald-400" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {aiAssistantEnabled ? "AI On" : "AI Off"}
              </span>
            </button>

            {/* Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className={`p-3 rounded-xl transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50 hover:border-slate-600/70"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50 hover:border-gray-300/70"
              }`}
            >
              <RiMenuLine className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-yellow-400 border border-slate-600/50 hover:border-slate-600/70"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-orange-500 border border-gray-300/50 hover:border-gray-300/70"
              }`}
            >
              {theme === "dark" ? (
                <RiSunLine className="w-5 h-5" />
              ) : (
                <RiMoonLine className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Code Editor - Left Side */}
        <div
          className={`main-content flex-1 flex flex-col transition-all duration-1000 ease-in-out ${
            sidebarOpen ? "mr-96" : "mr-20"
          }`}
        >
          <div className="flex-1 p-6">
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

        {/* AI Sidebar - Right Side */}
        <div
          className={`sidebar-container fixed top-0 right-0 h-full w-96 min-w-96 border-l flex flex-col flex-shrink-0 z-10 ${
            theme === "dark"
              ? "bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-xl"
              : "bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-200/50 backdrop-blur-xl"
          } ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        >
          {/* Sidebar Header */}
          <div
            className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
              theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                    : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
                }`}
              >
                <RiRobotLine
                  className={`w-5 h-5 ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  AI Assistant
                </h2>
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  {aiAssistantEnabled ? "Active" : "Disabled"}
                </div>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className={`smooth-button p-2 rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "hover:bg-slate-700/50 text-gray-400 hover:text-gray-300 border border-slate-600/50 hover:border-slate-600/70"
                  : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-600 border border-gray-300/50 hover:border-gray-300/70"
              }`}
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50"
                      : "bg-gradient-to-br from-gray-100/50 to-gray-200/50 border border-gray-300/50"
                  }`}
                >
                  <RiRobotLine
                    className={`w-8 h-8 ${
                      theme === "dark" ? "text-slate-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Start a conversation with your AI coding assistant
                </p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "ai" && (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                          : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
                      }`}
                    >
                      <RiRobotLine className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === "user"
                        ? theme === "dark"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : theme === "dark"
                        ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-gray-200 border border-slate-600/50 backdrop-blur-sm"
                        : "bg-gradient-to-br from-white/80 to-gray-50/80 text-gray-900 border border-gray-200/50 backdrop-blur-sm"
                    }`}
                  >
                    <pre
                      className={`whitespace-pre-wrap text-sm ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </pre>
                  </div>
                  {message.type === "user" && (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-slate-600/80 to-slate-700/80 border border-slate-500/50"
                          : "bg-gradient-to-br from-gray-200/80 to-gray-300/80 border border-gray-400/50"
                      }`}
                    >
                      <RiUserLine className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex space-x-3 justify-start">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                      : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
                  }`}
                >
                  <RiRobotLine className="w-5 h-5 text-emerald-400" />
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 backdrop-blur-sm"
                      : "bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div
            className={`p-6 border-t flex-shrink-0 ${
              theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
            }`}
          >
            <form onSubmit={handleChatSubmit} className="flex space-x-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything about your code..."
                disabled={!aiAssistantEnabled}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                    : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white/70 focus:border-emerald-500/50"
                } ${
                  !aiAssistantEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping || !aiAssistantEnabled}
                className={`smooth-button p-3 rounded-xl transition-all duration-300 ${
                  chatInput.trim() && !isTyping && aiAssistantEnabled
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                    : theme === "dark"
                    ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                    : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
                }`}
              >
                <RiSendPlaneLine className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions Panel (when sidebar is closed) */}
        <div
          className={`quick-actions-container fixed top-0 right-0 h-full w-20 min-w-20 border-l flex flex-col items-center py-6 space-y-4 flex-shrink-0 z-10 ${
            theme === "dark"
              ? "bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-xl"
              : "bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-200/50 backdrop-blur-xl"
          } ${!sidebarOpen ? "quick-actions-open" : "quick-actions-closed"}`}
        >
          <button
            onClick={toggleSidebar}
            className={`smooth-button p-4 rounded-xl transition-all duration-300 ${
              theme === "dark"
                ? "hover:bg-slate-700/50 text-gray-300 border border-slate-600/50 hover:border-slate-600/70"
                : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 hover:border-gray-300/70"
            }`}
            title="Open AI Assistant"
          >
            <RiRobotLine className="w-6 h-6" />
          </button>
          <button
            onClick={handleExplainCode}
            disabled={!aiAssistantEnabled}
            className={`smooth-button p-4 rounded-xl transition-all duration-300 ${
              theme === "dark"
                ? aiAssistantEnabled
                  ? "hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                : aiAssistantEnabled
                ? "hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:border-emerald-500/40"
                : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
            }`}
            title="Explain Code"
          >
            <RiSparklingLine className="w-6 h-6" />
          </button>
          <button
            onClick={handleAutocomplete}
            disabled={!aiAssistantEnabled}
            className={`smooth-button p-4 rounded-xl transition-all duration-300 ${
              theme === "dark"
                ? aiAssistantEnabled
                  ? "hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/50"
                  : "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                : aiAssistantEnabled
                ? "hover:bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:border-purple-500/40"
                : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
            }`}
            title="Get Suggestions"
          >
            <RiFlashlightFill className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
