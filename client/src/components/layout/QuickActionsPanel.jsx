import {
  RiRobotLine,
  RiFolderLine,
  RiSparklingLine,
  RiFlashlightFill,
} from "react-icons/ri"

const QuickActionsPanel = ({
  theme,
  sidebarOpen,
  user,
  aiAssistantEnabled,
  toggleSidebar,
  handleShowCodeManager,
  handleExplainCode,
  handleAutocomplete,
}) => {
  return (
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
  )
}

export default QuickActionsPanel 