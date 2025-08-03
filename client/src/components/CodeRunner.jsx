"use client";

import { useState } from "react";
import { RiPlayLine } from "react-icons/ri";

const CodeRunner = ({ code, language, theme, isActive, onActivate }) => {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput("");

    // Simulate code execution
    setTimeout(() => {
      if (language === "javascript") {
        try {
          // Simple JavaScript execution simulation
          const result = `> Running JavaScript code...
> 
> fibonacci(10) = 55
> 
> Execution completed in 0.023s`;
          setOutput(result);
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        }
      } else {
        setOutput(`> Running ${language} code...
> 
> Output would appear here
> 
> Note: Full execution environment not available in demo`);
      }
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div
      className={`h-full cursor-pointer transition-all duration-200 flex flex-col ${
        isActive ? "ring-2 ring-green-500/50" : ""
      }`}
      onClick={onActivate}
    >
      <div className="h-full flex flex-col">
        {/* Run Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            runCode();
          }}
          disabled={isRunning}
          className={`mb-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 flex-shrink-0 ${
            theme === "dark"
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-50"
              : "bg-green-500/20 hover:bg-green-500/30 text-green-600 disabled:opacity-50"
          }`}
        >
          <RiPlayLine
            className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`}
          />
          <span className="font-medium text-sm">
            {isRunning ? "Running..." : "Run Code"}
          </span>
        </button>

        {/* Output Terminal */}
        <div
          className={`flex-1 rounded-lg border font-mono text-sm overflow-y-auto min-h-0 ${
            theme === "dark"
              ? "bg-slate-900 border-slate-700 text-green-400"
              : "bg-gray-900 border-gray-700 text-green-300"
          }`}
        >
          <div className="p-4">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div
                className={`${
                  theme === "dark" ? "text-slate-500" : "text-gray-500"
                }`}
              >
                Output will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;
