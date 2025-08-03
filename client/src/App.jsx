"use client";

import { useState, useEffect } from "react";
import {
  RiSunLine,
  RiMoonLine,
  RiCodeLine,
  RiSparklingLine,
  RiFlashlightFill,
  RiPlayLine,
  RiRobotLine,
  RiSideBarFill,
} from "react-icons/ri";
import axios from "axios";
import CodeEditor from "./components/CodeEditor";
import AIExplanation from "./components/AIExplanation";
import AIAutocomplete from "./components/AIAutocomplete";
import CodeRunner from "./components/CodeRunner";

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

  const handleExplainCode = async () => {
    if (!code.trim()) return;

    setIsExplaining(true);
    setActivePanel("explanation");
    setExplanation("");

    try {
      const response = await axios.post("/explain", { code });
      setExplanation(response.data.explanation);
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
    if (!code.trim()) return;

    setActivePanel("suggestions");
    setSuggestions([]);

    try {
      const response = await axios.post("/autocomplete", { code });
      const suggestion = response.data.suggestion;

      setSuggestions([
        {
          code: suggestion,
          description: "AI-generated code suggestion",
        },
      ]);
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

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        theme === "dark" ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className={`border-b h-12 flex items-center px-4 ${
            theme === "dark"
              ? "bg-[#2d2d30] border-[#3e3e42]"
              : "bg-[#f3f3f3] border-gray-300"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-1.5 rounded ${
                theme === "dark" ? "bg-blue-600/20" : "bg-blue-500/20"
              }`}
            >
              <RiCodeLine
                className={`w-4 h-4 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h1 className="text-sm font-medium">AI Code Studio Pro</h1>
            <div
              className={`px-2 py-0.5 rounded text-xs ${
                theme === "dark"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-500/20 text-blue-600"
              }`}
            >
              Powered by Gemini
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                theme === "dark"
                  ? "hover:bg-white text-gray-300"
                  : "hover:bg-black text-gray-600"
              }`}
            >
              <RiSideBarFill className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                theme === "dark"
                  ? "hover:bg-white text-yellow-400"
                  : "hover:bg-black text-orange-500"
              }`}
            >
              {theme === "dark" ? (
                <RiSunLine className="w-4 h-4" />
              ) : (
                <RiMoonLine className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 p-4">
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            onExplain={handleExplainCode}
            onAutocomplete={handleAutocomplete}
          />
        </div>
      </div>

      {/* Right Sidebar - AI Agent Panel */}
      {sidebarOpen && (
        <div
          className={`w-80 border-l flex flex-col ${
            theme === "dark"
              ? "bg-[#252526] border-[#3e3e42]"
              : "bg-[#f8f8f8] border-gray-300"
          }`}
        >
          {/* Sidebar Header */}
          <div
            className={`p-4 border-b ${
              theme === "dark" ? "border-[#3e3e42]" : "border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <RiRobotLine className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Edit with AI Copilot</h2>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Agent Mode
                </p>
              </div>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Ask Copilot to edit your files in{" "}
              <span className="text-blue-500 underline">agent mode</span>.
              Copilot will automatically use multiple requests to pick files to
              edit, run terminal commands, and iterate on errors.
            </p>
            <p
              className={`text-xs mt-2 ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Copilot is powered by AI, so mistakes are possible. Review output
              carefully before use.
            </p>
          </div>

          {/* AI Panel Tabs */}
          <div
            className={`flex border-b ${
              theme === "dark" ? "border-[#3e3e42]" : "border-gray-300"
            }`}
          >
            <button
              onClick={() => setActivePanel("explanation")}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activePanel === "explanation"
                  ? theme === "dark"
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-blue-500 text-blue-600 bg-blue-500/10"
                  : theme === "dark"
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-600 hover:text-gray-700"
              }`}
            >
              <RiSparklingLine className="w-3 h-3 inline mr-1" />
              Explain
            </button>
            <button
              onClick={() => setActivePanel("suggestions")}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activePanel === "suggestions"
                  ? theme === "dark"
                    ? "border-purple-500 text-purple-400 bg-purple-500/10"
                    : "border-purple-500 text-purple-600 bg-purple-500/10"
                  : theme === "dark"
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-600 hover:text-gray-700"
              }`}
            >
              <RiFlashlightFill className="w-3 h-3 inline mr-1" />
              Suggest
            </button>
            <button
              onClick={() => setActivePanel("output")}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activePanel === "output"
                  ? theme === "dark"
                    ? "border-green-500 text-green-400 bg-green-500/10"
                    : "border-green-500 text-green-600 bg-green-500/10"
                  : theme === "dark"
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-600 hover:text-gray-700"
              }`}
            >
              <RiPlayLine className="w-3 h-3 inline mr-1" />
              Run
            </button>
          </div>

          {/* AI Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === "explanation" && (
              <div className="h-full p-4">
                <AIExplanation
                  explanation={explanation}
                  isExplaining={isExplaining}
                  theme={theme}
                  isActive={true}
                  onActivate={() => {}}
                />
              </div>
            )}
            {activePanel === "suggestions" && (
              <div className="h-full p-4">
                <AIAutocomplete
                  suggestions={suggestions}
                  theme={theme}
                  isActive={true}
                  onActivate={() => {}}
                  onApplySuggestion={setCode}
                />
              </div>
            )}
            {activePanel === "output" && (
              <div className="h-full p-4">
                <CodeRunner
                  code={code}
                  language={language}
                  theme={theme}
                  isActive={true}
                  onActivate={() => {}}
                />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className={`p-4 border-t ${
              theme === "dark" ? "border-[#3e3e42]" : "border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-green-400" : "bg-green-500"
                }`}
              />
              <span
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                CodeEditor.jsx Current file
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Add Context..."
                className={`w-full px-3 py-2 text-sm rounded border ${
                  theme === "dark"
                    ? "bg-[#3c3c3c] border-[#5a5a5a] text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={handleExplainCode}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    theme === "dark"
                      ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                      : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
                  }`}
                >
                  Explain Code
                </button>
                <button
                  onClick={handleAutocomplete}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    theme === "dark"
                      ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                      : "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                  }`}
                >
                  Get Suggestions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
