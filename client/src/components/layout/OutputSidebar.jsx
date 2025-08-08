"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiCloseLine,
  RiPlayLine,
  RiRefreshLine,
  RiTerminalLine,
  RiCodeAiLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiDownloadLine,
  RiFullscreenLine,
  RiSettings3Line,
  RiPulseLine,
  RiCheckboxCircleLine,
  RiFileCopyLine,
  RiSettingsLine,
} from "react-icons/ri";

const OutputSidebar = ({
  theme,
  outputSidebarOpen,
  toggleOutputSidebar,
  code,
  language,
  aiAssistantEnabled,
  handleShowSettings,
}) => {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [status, setStatus] = useState("");
  const [outputType, setOutputType] = useState("success"); // success, error, warning, info
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animatedOutput, setAnimatedOutput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [lineNumbers, setLineNumbers] = useState(true);

  // Advanced output animation
  useEffect(() => {
    if (output && !isRunning) {
      setAnimatedOutput("");
      let index = 0;
      const timer = setInterval(() => {
        if (index < output.length) {
          setAnimatedOutput(output.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 15);
      return () => clearInterval(timer);
    }
  }, [output, isRunning]);

  const runCode = async () => {
    if (!code || !code.trim()) {
      setOutput("❌ No code to execute. Please write some code first.");
      setOutputType("error");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setAnimatedOutput("");
    const startTime = Date.now();

    try {
      // Call your Judge0 compiler service
      const response = await axios.post(
        "http://localhost:5432/api/compiler/execute",
        {
          sourceCode: code,
          language: language,
        }
      );

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (response.data.success) {
        const { data } = response.data;

        // Clean terminal-style output like VS Code/IntelliJ
        let terminalOutput = "";

        // Add stdout if available (only the actual output)
        if (data.stdout) {
          terminalOutput += data.stdout;
        }

        // Add stderr if available
        if (data.stderr) {
          terminalOutput += data.stderr;
        }

        setOutput(terminalOutput);

        // Store execution info for header display
        if (data.status && data.status.description) {
          setStatus(data.status.description);
        }
        if (data.time) {
          setExecutionTime(data.time);
        }
        if (data.memory) {
          setMemoryUsage(data.memory);
        }

        // Set output type based on status
        if (data.status && data.status.id === 3) {
          setOutputType("success"); // Accepted
        } else if (data.stderr) {
          setOutputType("error"); // Has error output
        } else {
          setOutputType("warning"); // Other status
        }
      } else {
        // Handle API error response
        const errorOutput = `❌ EXECUTION ERROR
Status: Failed
Time: ${endTime - startTime}ms

💬 Error Message:
   ${response.data.message || "Unknown error occurred"}

🔧 Troubleshooting:
   • Check your code syntax
   • Verify the language is supported
   • Try with simpler code first`;

        setOutput(errorOutput);
        setOutputType("error");
      }
    } catch (error) {
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      console.error("API Error:", error);

      let errorMessage = "Connection failed";
      let troubleshooting = [
        "• Check if compiler service is running on port 5432",
        "• Verify your internet connection",
        "• Try refreshing the page",
      ];

      if (error.response) {
        errorMessage =
          error.response.data?.message || `HTTP ${error.response.status} Error`;
        if (error.response.status === 400) {
          troubleshooting = [
            "• Check your code syntax",
            "• Verify the programming language",
            "• Remove any invalid characters",
          ];
        } else if (error.response.status === 500) {
          troubleshooting = [
            "• Server error occurred",
            "• Try again in a few seconds",
            "• Use simpler code to test",
          ];
        }
      } else if (error.request) {
        errorMessage = "No response from compiler service";
        troubleshooting = [
          "• Ensure compiler service is running",
          "• Check http://localhost:5432/health",
          "• Restart the compiler service",
        ];
      }

      const errorOutput = `❌ CONNECTION ERROR
Status: Connection Failed
Time: ${endTime - startTime}ms

💬 Error Message:
   ${errorMessage}

🔧 Troubleshooting Steps:
${troubleshooting.map((step) => `   ${step}`).join("\n")}

🌐 Service URL:
   http://localhost:5432/api/compiler/execute`;

      setOutput(errorOutput);
      setOutputType("error");
    }

    setIsRunning(false);
  };

  const clearOutput = () => {
    setOutput("");
    setAnimatedOutput("");
    setExecutionTime(0);
    setMemoryUsage(0);
    setStatus("");
    setOutputType("success");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    // You could add a toast notification here
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = () => {
    switch (outputType) {
      case "success":
        return theme === "dark" ? "text-emerald-400" : "text-emerald-600";
      case "error":
        return theme === "dark" ? "text-red-400" : "text-red-600";
      case "warning":
        return theme === "dark" ? "text-yellow-400" : "text-yellow-600";
      case "info":
        return theme === "dark" ? "text-blue-400" : "text-blue-600";
      default:
        return theme === "dark" ? "text-gray-400" : "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (outputType) {
      case "success":
        return <RiCheckboxCircleLine className="w-5 h-5" />;
      case "error":
        return <RiErrorWarningLine className="w-5 h-5" />;
      case "warning":
        return <RiErrorWarningLine className="w-5 h-5" />;
      case "info":
        return <RiInformationLine className="w-5 h-5" />;
      default:
        return <RiTerminalLine className="w-5 h-5" />;
    }
  };

  // Terminal color scheme for different modes
  const getTerminalColors = () => {
    if (theme === "dark") {
      return {
        background: "bg-gray-900",
        text: "text-gray-100",
        prompt: "text-green-400",
        error: "text-red-400",
        warning: "text-yellow-400",
        info: "text-blue-400",
        success: "text-emerald-400",
        border: "border-gray-700",
        selection: "bg-blue-600/30",
        cursor: "bg-green-400",
      };
    } else {
      return {
        background: "bg-black",
        text: "text-gray-100",
        prompt: "text-green-400",
        error: "text-red-400",
        warning: "text-yellow-400",
        info: "text-blue-400",
        success: "text-emerald-400",
        border: "border-gray-800",
        selection: "bg-blue-600/30",
        cursor: "bg-green-400",
      };
    }
  };

  const colors = getTerminalColors();

  return (
    <>
      {/* Overlay for mobile screens */}
      {outputSidebarOpen && (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden transition-opacity duration-300 ${
            outputSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleOutputSidebar}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 min-w-96 border-l flex flex-col flex-shrink-0 z-20 transition-transform duration-300 ease-out ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900/98 to-slate-950/98 border-slate-700/50 backdrop-blur-2xl shadow-2xl shadow-slate-900/50"
            : "bg-gradient-to-b from-white/98 to-gray-50/98 border-gray-200/50 backdrop-blur-2xl shadow-2xl shadow-gray-900/20"
        } ${outputSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Enhanced Header */}
        <div
          className={`flex flex-col p-6 border-b flex-shrink-0 ${
            theme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
          }`}
          style={{
            boxShadow: `
            inset 0 1px 0 ${
              theme === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.8)"
            },
            inset 0 -1px 0 ${
              theme === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.05)"
            }
          `,
          }}
        >
          {/* Title Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div
                className={`p-3 rounded-xl flex-shrink-0 relative overflow-hidden ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                    : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/10"
                }`}
                style={{
                  boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(147, 51, 234, 0.3),
                  0 10px 30px -5px rgba(147, 51, 234, 0.2)
                `,
                }}
              >
                <RiTerminalLine
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                {isRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className={`text-xl font-bold truncate ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Terminal
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`${getStatusColor()}`}>{getStatusIcon()}</div>
                  <span
                    className={`text-sm truncate ${
                      theme === "dark" ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {isRunning
                      ? "Executing..."
                      : output
                      ? `${outputType} • ${executionTime}ms`
                      : "Ready to run"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleOutputSidebar}
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 ml-4 ${
                theme === "dark"
                  ? "hover:bg-slate-700/50 text-gray-400 hover:text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-lg"
                  : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-lg"
              }`}
              style={{
                boxShadow: `
                inset 0 1px 0 ${
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.4)"
                },
                inset 0 -1px 0 ${
                  theme === "dark"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(0, 0, 0, 0.02)"
                }
              `,
              }}
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Control Panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={runCode}
                disabled={isRunning || !code.trim()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  !isRunning && code.trim()
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                      : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-600 border border-emerald-500/20 shadow-emerald-500/10"
                    : theme === "dark"
                    ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 cursor-not-allowed"
                    : "bg-gray-200/50 text-gray-400 border border-gray-300/50 cursor-not-allowed"
                }`}
                style={{
                  boxShadow:
                    !isRunning && code.trim()
                      ? `
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(16, 185, 129, 0.3),
                    0 10px 30px -5px rgba(16, 185, 129, 0.2)
                  `
                      : `
                    inset 0 1px 0 ${
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(255, 255, 255, 0.2)"
                    },
                    inset 0 -1px 0 ${
                      theme === "dark"
                        ? "rgba(0, 0, 0, 0.05)"
                        : "rgba(0, 0, 0, 0.01)"
                    }
                  `,
                }}
              >
                {isRunning ? (
                  <>
                    <RiPulseLine className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <RiPlayLine className="w-4 h-4" />
                    <span>Execute</span>
                  </>
                )}
              </button>

              <button
                onClick={clearOutput}
                disabled={!output}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  output
                    ? theme === "dark"
                      ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50"
                      : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50"
                    : theme === "dark"
                    ? "bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                    : "bg-gray-100/50 text-gray-400 border border-gray-200/50 cursor-not-allowed"
                }`}
                title="Clear Output"
                style={{
                  boxShadow: `
                  inset 0 1px 0 ${
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.4)"
                  },
                  inset 0 -1px 0 ${
                    theme === "dark"
                      ? "rgba(0, 0, 0, 0.1)"
                      : "rgba(0, 0, 0, 0.02)"
                  }
                `,
                }}
              >
                <RiRefreshLine className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {output && (
                <>
                  <button
                    onClick={copyOutput}
                    className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark"
                        ? "bg-slate-700/50 hover:bg-slate-700/70 text-blue-400 border border-blue-500/30"
                        : "bg-gray-200/50 hover:bg-gray-200/70 text-blue-600 border border-blue-500/20"
                    }`}
                    title="Copy Output"
                    style={{
                      boxShadow: `
                      inset 0 1px 0 ${
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.4)"
                      },
                      inset 0 -1px 0 ${
                        theme === "dark"
                          ? "rgba(0, 0, 0, 0.1)"
                          : "rgba(0, 0, 0, 0.02)"
                      }
                    `,
                    }}
                  >
                    <RiFileCopyLine className="w-4 h-4" />
                  </button>

                  <button
                    onClick={downloadOutput}
                    className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark"
                        ? "bg-slate-700/50 hover:bg-slate-700/70 text-purple-400 border border-purple-500/30"
                        : "bg-gray-200/50 hover:bg-gray-200/70 text-purple-600 border border-purple-500/20"
                    }`}
                    title="Download Output"
                    style={{
                      boxShadow: `
                      inset 0 1px 0 ${
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.4)"
                      },
                      inset 0 -1px 0 ${
                        theme === "dark"
                          ? "rgba(0, 0, 0, 0.1)"
                          : "rgba(0, 0, 0, 0.02)"
                      }
                    `,
                    }}
                  >
                    <RiDownloadLine className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50"
                }`}
                title="Terminal Settings"
                style={{
                  boxShadow: `
                  inset 0 1px 0 ${
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.4)"
                  },
                  inset 0 -1px 0 ${
                    theme === "dark"
                      ? "rgba(0, 0, 0, 0.1)"
                      : "rgba(0, 0, 0, 0.02)"
                  }
                `,
                }}
              >
                <RiSettings3Line
                  className={`w-4 h-4 ${showSettings ? "animate-spin" : ""}`}
                />
              </button>

              {/* Main Settings Button */}
              <button
                onClick={handleShowSettings}
                className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-slate-700/50 hover:bg-slate-700/70 text-blue-400 border border-blue-500/30"
                    : "bg-gray-200/50 hover:bg-gray-200/70 text-blue-600 border border-blue-500/20"
                }`}
                title="App Settings"
                style={{
                  boxShadow: `
                  inset 0 1px 0 ${
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.4)"
                  },
                  inset 0 -1px 0 ${
                    theme === "dark"
                      ? "rgba(0, 0, 0, 0.1)"
                      : "rgba(0, 0, 0, 0.02)"
                  }
                `,
                }}
              >
                <RiSettingsLine className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div
              className={`mt-4 p-4 rounded-xl backdrop-blur-xl border ${
                theme === "dark"
                  ? "bg-slate-800/50 border-slate-600/50"
                  : "bg-white/50 border-gray-200/50"
              }`}
              style={{
                boxShadow: `
                inset 0 1px 0 ${
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.5)"
                },
                inset 0 -1px 0 ${
                  theme === "dark"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(0, 0, 0, 0.02)"
                }
              `,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Font Size
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                      theme === "dark"
                        ? "bg-slate-700 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    -
                  </button>
                  <span
                    className={`text-sm px-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                      theme === "dark"
                        ? "bg-slate-700 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Line Numbers
                </span>
                <button
                  onClick={() => setLineNumbers(!lineNumbers)}
                  className={`w-10 h-6 rounded-full transition-all duration-300 ${
                    lineNumbers
                      ? "bg-emerald-500"
                      : theme === "dark"
                      ? "bg-slate-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      lineNumbers ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real Terminal Output */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div
            className={`flex-1 font-mono text-sm overflow-y-auto min-h-0 m-4 rounded-xl border backdrop-blur-xl ${colors.background} ${colors.border}`}
            style={{
              fontSize: `${fontSize}px`,
              boxShadow: `
              inset 0 2px 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.1)"
              },
              inset 0 -2px 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)"
              },
              inset 2px 0 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(255, 255, 255, 0.05)"
              },
              inset -2px 0 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)"
              },
              0 20px 40px -10px rgba(0, 0, 0, 0.3)
            `,
            }}
          >
            <div className="p-6 relative">
              {/* Terminal Header */}
              <div
                className={`flex items-center justify-between mb-4 pb-3 border-b ${colors.border}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                  </div>
                  <span className={`text-xs font-medium ${colors.text}`}>
                    Terminal • {language}
                  </span>
                </div>
                {(executionTime > 0 || memoryUsage > 0 || status) && (
                  <div className="flex items-center space-x-2">
                    {memoryUsage > 0 && (
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                          theme === "dark"
                            ? "bg-slate-800/50 text-slate-400 border border-slate-700/50"
                            : "bg-gray-800/50 text-gray-400 border border-gray-700/50"
                        }`}
                      >
                        <RiPulseLine className="w-3 h-3" />
                        <span>{memoryUsage} KB</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Terminal Content */}
              {isRunning ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                          : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/10"
                      }`}
                    >
                      <RiCodeAiLine
                        className={`w-8 h-8 animate-pulse ${
                          theme === "dark"
                            ? "text-purple-400"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                      Executing Code
                    </h3>
                    <p className={`text-sm ${colors.text} opacity-70`}>
                      Please wait while your {language} code is being
                      processed...
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              ) : animatedOutput || output ? (
                <div className="relative">
                  <pre
                    className={`whitespace-pre-wrap leading-relaxed ${
                      lineNumbers ? "pl-12" : ""
                    } ${colors.text}`}
                    style={{
                      fontFamily: "JetBrains Mono, Consolas, monospace",
                    }}
                  >
                    {animatedOutput || output}
                  </pre>
                  {lineNumbers && (
                    <div className="absolute left-0 top-0 text-xs text-gray-500 select-none">
                      {(animatedOutput || output)
                        .split("\n")
                        .map((_, index) => (
                          <div
                            key={index}
                            className="h-6 flex items-center px-2"
                          >
                            {index + 1}
                          </div>
                        ))}
                    </div>
                  )}
                  {animatedOutput && animatedOutput.length < output.length && (
                    <span
                      className={`inline-block w-2 h-5 ml-1 animate-pulse ${colors.cursor}`}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-slate-800/50 border border-slate-700/50 shadow-xl"
                        : "bg-gray-800/50 border border-gray-700/50 shadow-xl"
                    }`}
                    style={{
                      boxShadow: `
                      inset 0 1px 0 rgba(255, 255, 255, 0.05),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.2),
                      0 10px 30px -5px rgba(0, 0, 0, 0.3)
                    `,
                    }}
                  >
                    <RiTerminalLine
                      className={`w-10 h-10 ${
                        theme === "dark" ? "text-slate-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                      Ready to Execute
                    </h3>
                    <p className={`text-sm ${colors.text} opacity-70`}>
                      Click "Execute" to run your {language} code and see the
                      output here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutputSidebar;
