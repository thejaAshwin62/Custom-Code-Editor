"use client";

import { useState, useEffect } from "react";
import {
  RiSunLine,
  RiMoonLine,
  RiCodeLine,
  RiSparklingLine,
  RiFlashlightFill,
  RiPlayLine,
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

      // Format the suggestion for display
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
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b backdrop-blur-md sticky top-0 z-50 ${
          theme === "dark"
            ? "bg-slate-900/80 border-slate-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                theme === "dark" ? "bg-emerald-500/20" : "bg-blue-500/20"
              }`}
            >
              <RiCodeLine
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-emerald-400" : "text-blue-600"
                }`}
              />
            </div>
            <h1
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              AI Code Studio Pro
            </h1>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                theme === "dark"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-500/20 text-blue-600"
              }`}
            >
              Powered by Gemini
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-orange-500"
            }`}
          >
            {theme === "dark" ? (
              <RiSunLine className="w-5 h-5" />
            ) : (
              <RiMoonLine className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Bento Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-10rem)]">
          {/* Code Editor - Large Card */}
          <div className="lg:col-span-2 min-h-0">
            <BentoCard
              title="Code Editor"
              icon={<RiCodeLine className="w-5 h-5" />}
              theme={theme}
              className="h-full"
            >
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                onExplain={handleExplainCode}
                onAutocomplete={handleAutocomplete}
              />
            </BentoCard>
          </div>

          {/* Right Column - AI Features */}
          <div className="space-y-4 sm:space-y-6 min-h-0 flex flex-col">
            {/* AI Explanation */}
            <div className="flex-1 min-h-0">
              <BentoCard
                title="AI Code Explanation"
                icon={<RiSparklingLine className="w-5 h-5" />}
                theme={theme}
                className="h-full"
              >
                <AIExplanation
                  explanation={explanation}
                  isExplaining={isExplaining}
                  theme={theme}
                  isActive={activePanel === "explanation"}
                  onActivate={() => setActivePanel("explanation")}
                />
              </BentoCard>
            </div>

            {/* AI Autocomplete */}
            <div className="flex-1 min-h-0">
              <BentoCard
                title="AI Suggestions"
                icon={<RiFlashlightFill className="w-5 h-5" />}
                theme={theme}
                className="h-full"
              >
                <AIAutocomplete
                  suggestions={suggestions}
                  theme={theme}
                  isActive={activePanel === "suggestions"}
                  onActivate={() => setActivePanel("suggestions")}
                  onApplySuggestion={setCode}
                />
              </BentoCard>
            </div>

            {/* Code Runner */}
            <div className="flex-1 min-h-0">
              <BentoCard
                title="Live Output"
                icon={<RiPlayLine className="w-5 h-5" />}
                theme={theme}
                className="h-full"
              >
                <CodeRunner
                  code={code}
                  language={language}
                  theme={theme}
                  isActive={activePanel === "output"}
                  onActivate={() => setActivePanel("output")}
                />
              </BentoCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
