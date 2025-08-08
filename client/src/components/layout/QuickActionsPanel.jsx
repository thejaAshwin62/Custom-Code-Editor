"use client";

import {
  RiSparklingLine,
  RiFlashlightFill,
  RiRobotLine,
  RiTerminalLine,
  RiMenuLine,
  RiFolderLine,
  RiSettingsLine,
} from "react-icons/ri";

const QuickActionsPanel = ({
  theme,
  sidebarOpen,
  outputSidebarOpen,
  user,
  aiAssistantEnabled,
  toggleSidebar,
  toggleOutputSidebar,
  handleShowCodeManager,
  handleExplainCode,
  handleAutocomplete,
  handleShowSettings,
}) => {
  return (
    <div
      className={`quick-actions-container fixed top-0 right-0 h-full w-20 min-w-20 border-l flex flex-col items-center py-8 space-y-6 flex-shrink-0 z-20 ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900/98 to-slate-950/98 border-slate-700/50 backdrop-blur-2xl shadow-2xl shadow-slate-900/50"
          : "bg-gradient-to-b from-white/98 to-gray-50/98 border-gray-200/50 backdrop-blur-2xl shadow-2xl shadow-gray-900/20"
      } ${
        !sidebarOpen && !outputSidebarOpen
          ? "quick-actions-open"
          : "quick-actions-closed"
      }`}
    >
      {/* AI Assistant Toggle */}
      <button
        onClick={toggleSidebar}
        className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
          sidebarOpen
            ? theme === "dark"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-emerald-500/10"
            : theme === "dark"
            ? "hover:bg-slate-700/50 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-slate-900/25"
            : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-gray-900/10"
        }`}
        title="Toggle AI Assistant"
        style={{
          boxShadow: sidebarOpen
            ? `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(16, 185, 129, 0.3),
              0 10px 30px -5px rgba(16, 185, 129, 0.2)
            `
            : `
              inset 0 1px 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.4)"
              },
              inset 0 -1px 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
              }
            `,
        }}
      >
        <RiRobotLine className="w-6 h-6" />
      </button>

      {/* Output Terminal Toggle */}
      <button
        onClick={toggleOutputSidebar}
        className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
          outputSidebarOpen
            ? theme === "dark"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-purple-500/10"
              : "bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-purple-500/10"
            : theme === "dark"
            ? "hover:bg-slate-700/50 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-slate-900/25"
            : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-gray-900/10"
        }`}
        title="Toggle Output Terminal"
        style={{
          boxShadow: outputSidebarOpen
            ? `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(147, 51, 234, 0.3),
              0 10px 30px -5px rgba(147, 51, 234, 0.2)
            `
            : `
              inset 0 1px 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.4)"
              },
              inset 0 -1px 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
              }
            `,
        }}
      >
        <RiTerminalLine className="w-6 h-6" />
      </button>

      {/* Code Manager */}
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
        style={{
          boxShadow: `
            inset 0 1px 0 ${
              theme === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.4)"
            },
            inset 0 -1px 0 ${
              theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
            }
          `,
        }}
      >
        <RiFolderLine className="w-6 h-6" />
      </button>

      {/* Explain Code */}
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
        style={{
          boxShadow: aiAssistantEnabled
            ? `
              inset 0 1px 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.4)"
              },
              inset 0 -1px 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
              }
            `
            : "none",
        }}
      >
        <RiSparklingLine className="w-6 h-6" />
      </button>

      {/* Get Suggestions */}
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
        style={{
          boxShadow: aiAssistantEnabled
            ? `
              inset 0 1px 0 ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.4)"
              },
              inset 0 -1px 0 ${
                theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
              }
            `
            : "none",
        }}
      >
        <RiFlashlightFill className="w-6 h-6" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Close All Panels */}
      <button
        onClick={() => {
          if (sidebarOpen) toggleSidebar();
          if (outputSidebarOpen) toggleOutputSidebar();
        }}
        className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
          theme === "dark"
            ? "hover:bg-slate-700/50 text-gray-300 border border-slate-600/50 hover:border-slate-600/70 shadow-slate-900/25"
            : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50 hover:border-gray-300/70 shadow-gray-900/10"
        }`}
        title="Close All Panels"
        style={{
          boxShadow: `
            inset 0 1px 0 ${
              theme === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.4)"
            },
            inset 0 -1px 0 ${
              theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
            }
          `,
        }}
      >
        <RiMenuLine className="w-6 h-6" />
      </button>

      {/* Settings */}
      <button
        onClick={handleShowSettings}
        className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
          theme === "dark"
            ? "hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 shadow-blue-500/10"
            : "hover:bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/10"
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
              theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)"
            }
          `,
        }}
      >
        <RiSettingsLine className="w-6 h-6" />
      </button>
    </div>
  );
};

export default QuickActionsPanel;
