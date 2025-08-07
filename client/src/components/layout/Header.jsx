import {
  RiSunLine,
  RiMoonLine,
  RiCodeLine,
  RiRobotLine,
  RiHomeLine,
  RiFolderLine,
} from "react-icons/ri";

const Header = ({
  theme,
  currentRoute,
  user,
  aiAssistantEnabled,
  sidebarOpen,
  outputSidebarOpen,
  toggleTheme,
  toggleAiAssistant,
  toggleSidebar,
  handleGoHome,
  handleShowCodeManager,
}) => {
  return (
    <header
      className={`border-b backdrop-blur-xl flex-shrink-0 transition-all duration-700 ease-in-out ${
        sidebarOpen && outputSidebarOpen
          ? "mr-96" // Fallback class for both sidebars (will be overridden by inline style)
          : sidebarOpen || outputSidebarOpen
          ? "mr-96" // One sidebar open: 384px
          : "mr-20" // No sidebars open: 80px
      } ${
        theme === "dark"
          ? "bg-slate-900/95 border-slate-700/50 shadow-2xl shadow-slate-900/50"
          : "bg-white/95 border-gray-200/50 shadow-2xl shadow-gray-900/10"
      }`}
      style={{
        marginRight:
          sidebarOpen && outputSidebarOpen
            ? "768px" // Both sidebars open: 384px + 384px
            : sidebarOpen || outputSidebarOpen
            ? "384px" // One sidebar open: 384px
            : "80px", // No sidebars open: 80px (QuickActionsPanel)
        transition: "margin-right 0.7s ease-in-out",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
          <div
            className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            }`}
          >
            <RiCodeLine
              className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${
                theme === "dark" ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1
              className={`text-sm sm:text-lg lg:text-2xl font-bold truncate ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              AI Code Studio Pro
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
              {/* <div
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border border-blue-500/20"
                }`}
              >
                <span className="hidden sm:inline">Powered by </span>Gemini AI
              </div> */}
              <div
                className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
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
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    aiAssistantEnabled
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span className="hidden sm:inline">
                  {aiAssistantEnabled ? "AI Active" : "AI Offline"}
                </span>
                <span className="sm:hidden">
                  {aiAssistantEnabled ? "ON" : "OFF"}
                </span>
              </div>

              {/* Debug: Sidebar State Indicator - Hide on mobile */}
              {/* <div
                className={`hidden md:flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  theme === "dark"
                    ? "bg-slate-700/50 text-slate-300"
                    : "bg-gray-200/50 text-gray-600"
                }`}
              >
                <span>AI Sidebar: {sidebarOpen ? "Open" : "Closed"} | Output Sidebar: {outputSidebarOpen ? "Open" : "Closed"}</span>
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoHome}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-300 ${
                currentRoute === "home"
                  ? theme === "dark"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : theme === "dark"
                  ? "hover:bg-slate-700/50 text-slate-300 border border-slate-600/50"
                  : "hover:bg-gray-200/50 text-gray-600 border border-gray-300/50"
              }`}
            >
              <RiHomeLine className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Home
              </span>
            </button>

            {currentRoute !== "home" && (
              <>
                <span
                  className={`text-xs sm:text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  /
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentRoute === "editor" && "Code Editor"}
                  {currentRoute === "code-manager" && "Code Manager"}
                  {currentRoute === "code-treasure" && "Code Treasure"}
                </span>
              </>
            )}
          </div>

          {/* Code Manager Button */}
          <button
            onClick={handleShowCodeManager}
            className={`flex items-center space-x-1 sm:space-x-2 lg:space-x-3 px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
              user
                ? theme === "dark"
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 shadow-blue-500/10"
                  : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 shadow-blue-500/10"
                : theme === "dark"
                ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 shadow-orange-500/10"
                : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 shadow-orange-500/10"
            }`}
            title={
              !user ? "Sign in to access Code Manager" : "Open Code Manager"
            }
          >
            <RiFolderLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden lg:inline">
              {user ? "Code Manager" : "Sign in for Code Manager"}
            </span>
            <span className="text-xs sm:text-sm font-medium lg:hidden">
              {user ? "Manager" : "Sign in"}
            </span>
          </button>

          {/* Combined AI Assistant & Sidebar Toggle Button */}
          <button
            onClick={() => {
              if (sidebarOpen) {
                // If sidebar is open, close it
                toggleSidebar();
              } else {
                // If sidebar is closed, enable AI if disabled and open sidebar
                if (!aiAssistantEnabled) {
                  toggleAiAssistant();
                }
                toggleSidebar();
              }
            }}
            className={`flex items-center space-x-1 sm:space-x-2 lg:space-x-3 px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
              sidebarOpen
                ? theme === "dark"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30 shadow-lg shadow-emerald-500/10"
                  : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-green-500/20 shadow-lg shadow-emerald-500/10"
                : theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/70"
                : "bg-gray-200/50 text-gray-500 border border-gray-300/50 hover:bg-gray-200/70"
            }`}
            title={sidebarOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <RiRobotLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden lg:inline">
              {sidebarOpen ? "AI Assistant" : "AI Assistant"}
            </span>
            <span className="text-xs sm:text-sm font-medium lg:hidden">AI</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
              theme === "dark"
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                : "bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-500 border border-orange-500/30 shadow-lg shadow-orange-500/10"
            }`}
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <RiSunLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            ) : (
              <RiMoonLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
