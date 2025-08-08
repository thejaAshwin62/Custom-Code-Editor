import {
  RiCloseLine,
  RiRobotLine,
  RiUserLine,
  RiSendPlaneLine,
  RiSettingsLine,
} from "react-icons/ri";
import { UserButton } from "@clerk/clerk-react";

const AISidebar = ({
  theme,
  sidebarOpen,
  user,
  aiAssistantEnabled,
  chatMessages,
  chatInput,
  isTyping,
  toggleSidebar,
  setChatInput,
  handleChatSubmit,
  handleShowSettings,
}) => {
  return (
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
              <RiRobotLine
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={`text-xl font-bold truncate ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                AI Assistant
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    aiAssistantEnabled
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span
                  className={`text-sm truncate ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
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
              <RiUserLine
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {user?.firstName || "User"}
              </span>
              <span className="text-xs opacity-70 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
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
              <RiRobotLine
                className={`w-10 h-10 ${
                  theme === "dark" ? "text-slate-500" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to AI Assistant
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Start a conversation with your intelligent coding companion
            </p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-4 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
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
                    message.type === "user"
                      ? "text-white"
                      : theme === "dark"
                      ? "text-gray-200"
                      : "text-gray-900"
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
  );
};

export default AISidebar;
