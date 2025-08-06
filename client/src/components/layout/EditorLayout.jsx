import { RiCodeLine, RiSaveLine, RiFolderLine } from "react-icons/ri";
import { SignInButton } from "@clerk/clerk-react";
import CodeEditor from "../CodeEditor";

const EditorLayout = ({
  theme,
  sidebarOpen,
  code,
  setCode,
  language,
  setLanguage,
  user,
  handleExplainCode,
  handleAutocomplete,
  aiAssistantEnabled,
  handleQuickSave,
  handleShowCodeManager,
}) => {
  return (
    <div
      className={`main-content flex-1 flex flex-col transition-all duration-700 ease-in-out ${
        sidebarOpen ? "mr-96" : "mr-20"
      } bg-transparent`}
      style={{ height: "100%" }}
    >
      {/* Editor area fills available space, page scrolls if needed */}
      <div
        className="flex-1 flex flex-col p-4 overflow-auto"
        style={{ minHeight: 0 }}
      >
        <div
          className={`flex-1 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
            theme === "dark"
              ? "bg-slate-900/50 border-slate-700/50 shadow-slate-900/50"
              : "bg-white/50 border-gray-200/50 shadow-gray-900/10"
          } flex flex-col`}
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
      {/* Sticky Action Bar at the bottom */}
      <div className="w-full px-4 pb-4 pt-2 bg-transparent sticky bottom-0 z-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user ? (
                <button
                  onClick={handleQuickSave}
                  disabled={!code.trim()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    code.trim()
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/30 shadow-emerald-500/10"
                        : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-green-500/20 border border-emerald-500/20 shadow-emerald-500/10"
                      : theme === "dark"
                      ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600/50"
                      : "bg-gray-200/50 text-gray-400 cursor-not-allowed border border-gray-300/50"
                  }`}
                  title="Save code to your account"
                >
                  <RiSaveLine className="w-4 h-4" />
                  <span>Quick Save</span>
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 shadow-orange-500/10"
                        : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/20 shadow-orange-500/10"
                    }`}
                    title="Sign in to save your code"
                  >
                    <RiSaveLine className="w-4 h-4" />
                    <span>Sign in to Save</span>
                  </button>
                </SignInButton>
              )}
            </div>
            <div className="text-xs opacity-70">{code.length} characters</div>
          </div>
          <div>
            {user ? (
              <button
                onClick={handleShowCodeManager}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 hover:from-emerald-500/30 hover:to-blue-500/30 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/10"
                    : "bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-600 hover:from-emerald-500/20 hover:to-blue-500/20 border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/10"
                }`}
                title="View your saved codes"
              >
                <RiFolderLine className="w-6 h-6" />
                <span className="font-medium text-lg">Open Code Manager</span>
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30 hover:border-orange-500/50 shadow-orange-500/10"
                      : "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 border-orange-500/20 hover:border-orange-500/40 shadow-orange-500/10"
                  }`}
                  title="Sign in to access your saved codes"
                >
                  <RiFolderLine className="w-6 h-6" />
                  <span className="font-medium text-lg">
                    Sign in for Code Manager
                  </span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
