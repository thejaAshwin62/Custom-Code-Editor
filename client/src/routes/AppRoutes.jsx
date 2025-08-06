import { RiSunLine, RiMoonLine, RiCodeLine } from "react-icons/ri"
import HomePage from "../components/HomePage"
import CodeManagerPage from "../components/CodeManagerPage"
import CodeTreasure from "../components/CodeTreasure"
import EditorLayout from "../components/layout/EditorLayout"

const AppRoutes = ({ currentRoute, theme, toggleTheme, ...props }) => {
  // Home route
  if (currentRoute === "home") {
    return (
      <div className="w-full overflow-auto">
        {/* Theme Toggle for Homepage */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-xl border ${
              theme === "dark"
                ? "bg-slate-800/80 hover:bg-slate-800 text-yellow-400 border-slate-700/50 hover:border-slate-600/70 shadow-lg"
                : "bg-white/80 hover:bg-white text-orange-500 border-gray-200/50 hover:border-gray-300/70 shadow-lg"
            }`}
            title="Toggle Theme"
          >
            {theme === "dark" ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
          </button>
        </div>

        <HomePage 
          theme={theme} 
          onGetStarted={props.handleGetStarted} 
          onShowCodeTreasure={props.handleShowCodeTreasure} 
        />
        
        {/* Additional button to go to editor for all users */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={props.handleGetStarted}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-xl border ${
              theme === "dark"
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/20 hover:border-emerald-500/40 shadow-lg shadow-emerald-500/10"
            }`}
            title="Go to Code Editor"
          >
            <RiCodeLine className="w-6 h-6" />
          </button>
        </div>
      </div>
    )
  }

  // Code Manager route
  if (currentRoute === "code-manager") {
    return (
      <CodeManagerPage 
        theme={theme} 
        onBack={props.handleBackFromCodeManager} 
        onLoadCode={props.handleLoadCode}
        currentCode={props.code}
        currentLanguage={props.language}
      />
    )
  }

  // Code Treasure route
  if (currentRoute === "code-treasure") {
    return (
      <CodeTreasure theme={theme} onBack={props.handleBackFromTreasure} />
    )
  }

  // Default: Editor route
  return (
    <EditorLayout
      theme={theme}
      sidebarOpen={props.sidebarOpen}
      code={props.code}
      setCode={props.setCode}
      language={props.language}
      setLanguage={props.setLanguage}
      user={props.user}
      handleExplainCode={props.handleExplainCode}
      handleAutocomplete={props.handleAutocomplete}
      aiAssistantEnabled={props.aiAssistantEnabled}
      handleQuickSave={props.handleQuickSave}
      handleShowCodeManager={props.handleShowCodeManager}
    />
  )
}

export default AppRoutes 