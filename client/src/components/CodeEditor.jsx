"use client";

import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  RiArrowDownSLine,
  RiMagicLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiSaveLine,
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";
import { IoLogoJavascript } from "react-icons/io5";
import { FaPython } from "react-icons/fa";
import { FaJava } from "react-icons/fa6";
import { IoLogoHtml5 } from "react-icons/io5";
import { IoLogoCss3 } from "react-icons/io";
import axios from "axios";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { toast } from "sonner";

const CodeEditor = () => {
  const { isLoaded, user } = useUser();
  const {
    code,
    setCode,
    language,
    setLanguage,
    theme,
    handleExplainCode: onExplain,
    handleAutocomplete: onAutocomplete,
    aiAssistantEnabled = true,
    sidebarOpen,
    outputSidebarOpen,
    handleQuickSave,
    user: outletUser,
  } = useOutletContext();

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [inlineCompletionsEnabled, setInlineCompletionsEnabled] =
    useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenSaveModal = () => {
    setSaveTitle("");
    setSaveDescription("");
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) return;
    setSaving(true);
    await handleQuickSave({ title: saveTitle, description: saveDescription });
    setSaving(false);
    setShowSaveModal(false);
  };

  const languages = [
    {
      id: "javascript",
      name: "JavaScript",
      icon: IoLogoJavascript,
      color: "#F7DF1E",
    },
    { id: "python", name: "Python", icon: FaPython, color: "#3776AB" },
    { id: "java", name: "Java", icon: FaJava, color: "#ED8B00" },
    { id: "html", name: "HTML", icon: IoLogoHtml5, color: "#E34F26" },
    { id: "css", name: "CSS", icon: IoLogoCss3, color: "#1572B6" },
  ];

  // Boilerplate code templates for different languages
  const getBoilerplateCode = (languageId) => {
    const boilerplates = {
      javascript: `// Welcome to JavaScript!
// This is a sample JavaScript code

function greetUser(name) {
  return \`Hello, \${name}! Welcome to JavaScript programming.\`;
}

// Example usage
const userName = "Developer";
const greeting = greetUser(userName);
console.log(greeting);

// You can start coding here...`,

      python: `# Welcome to Python!
# This is a sample Python code

def greet_user(name):
    """
    Function to greet a user
    """
    return f"Hello, {name}! Welcome to Python programming."

# Example usage
def main():
    user_name = "Developer"
    greeting = greet_user(user_name)
    print(greeting)
    
    # You can start coding here...

if __name__ == "__main__":
    main()`,

      java: `// Welcome to Java!
// This is a sample Java code

public class HelloWorld {
    
    public static void main(String[] args) {
        System.out.println("Hello, Developer! Welcome to Java programming.");
        
        // Create an instance and call methods
        HelloWorld app = new HelloWorld();
        String greeting = app.greetUser("Developer");
        System.out.println(greeting);
        
        // You can start coding here...
    }
    
    public String greetUser(String name) {
        return "Hello, " + name + "! Welcome to Java programming.";
    }
}`,

      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HTML</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .welcome {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="welcome">
        <h1>Welcome to HTML!</h1>
        <p>This is a sample HTML document. Start building your web page here.</p>
    </div>
    
    <h2>Getting Started</h2>
    <p>You can start coding your HTML here...</p>
    
    <script>
        console.log("Hello from HTML! Ready to code.");
    </script>
</body>
</html>`,

      css: `/* Welcome to CSS! */
/* This is a sample CSS stylesheet */

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.welcome-container {
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 500px;
}

.welcome-title {
    color: #667eea;
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: bold;
}

.welcome-text {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
}

/* You can start styling here... */`,
    };

    return (
      boilerplates[languageId] ||
      `// Welcome to ${languageId}!\n// Start coding here...`
    );
  };

  // Enhanced inline completion function
  const getInlineCompletion = async (model, position) => {
    if (!inlineCompletionsEnabled || !code.trim() || !aiAssistantEnabled)
      return null;

    try {
      setIsGenerating(true);
      const currentCode = model.getValue();
      const currentLanguage = model.getLanguageId();
      const lineContent = model.getLineContent(position.lineNumber);
      const wordAtPosition = model.getWordAtPosition(position);

      const response = await axios.post("/inline-completion", {
        code: currentCode,
        position: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
        language: currentLanguage,
        userId: user?.id,
        lineContent,
        wordAtPosition: wordAtPosition?.word || "",
      });

      setIsGenerating(false);

      const handleSuggestion = (completion) => {
        if (completion && completion.text) {
          setCurrentSuggestion({
            text: completion.text,
            range: completion.range,
          });
          return completion;
        }
        setCurrentSuggestion(null);
        return null;
      };

      if (response.data && response.data.completion) {
        const completion = {
          text: response.data.completion,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column,
          },
        };
        return handleSuggestion(completion);
      }
      return null;
    } catch (error) {
      setIsGenerating(false);
      console.error("Inline completion error:", error);
      return null;
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const disposables = languages.map((lang) =>
      monaco.languages.registerInlineCompletionsProvider(lang.id, {
        triggerCharacters: [".", " ", "(", "{", "[", '"', "'", "_", "="],
        handleDidShowCompletionItem: () => {},
        handleDidPartialAccept: () => {},
        async provideInlineCompletions(model, position, context, token) {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }

          return new Promise((resolve) => {
            debounceRef.current = setTimeout(async () => {
              if (token.isCancellationRequested) {
                resolve({ items: [] });
                return;
              }

              try {
                const completion = await getInlineCompletion(model, position);

                if (!completion || !completion.text) {
                  resolve({ items: [] });
                  return;
                }

                const items = [
                  {
                    insertText: completion.text,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    },
                    command: { id: "editor.action.inlineSuggest.commit" },
                  },
                ];

                resolve({ items });
              } catch (error) {
                console.error("Provider error:", error);
                resolve({ items: [] });
              }
            }, 300);
          });
        },
        freeInlineCompletions() {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }
        },
      })
    );

    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        const model = editor.getModel();
        const position = editor.getPosition();

        if (currentSuggestion && currentSuggestion.text) {
          model.pushEditOperations(
            [],
            [
              {
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
                text: currentSuggestion.text,
              },
            ],
            () => null
          );
          setCurrentSuggestion(null);
          return true;
        }
        return false;
      },
      "inlineSuggestionVisible"
    );

    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Tab && currentSuggestion) {
        const model = editor.getModel();
        const position = editor.getPosition();

        model.pushEditOperations(
          [],
          [
            {
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              text: currentSuggestion.text,
            },
          ],
          () => null
        );
        setCurrentSuggestion(null);
        e.preventDefault();
        e.stopPropagation();
      }
    });

    return () => {
      disposables.forEach((disposable) => disposable.dispose());
    };
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
    localStorage.setItem("code", value || "");
  };

  // Handle language change with boilerplate code generation
  const handleLanguageChange = (newLanguage) => {
    // Check if current code is empty or just whitespace
    const currentCode = code.trim();

    if (!currentCode) {
      // If editor is empty, automatically load boilerplate
      const boilerplate = getBoilerplateCode(newLanguage);
      setCode(boilerplate);
      localStorage.setItem("code", boilerplate);
    } else {
      // If there's existing code, show toast with action buttons
      const languageName = languages.find(
        (lang) => lang.id === newLanguage
      )?.name;

      toast(`Replace with ${languageName} boilerplate?`, {
        description: "You have existing code. Choose what to do:",
        duration: 10000, // Give user time to decide
        position: "top-center",
        action: {
          label: "Replace Code",
          onClick: () => {
            const boilerplate = getBoilerplateCode(newLanguage);
            setCode(boilerplate);
            localStorage.setItem("code", boilerplate);
            toast.success(`Switched to ${languageName} with boilerplate code!`);
          },
        },
        cancel: {
          label: "Keep Code",
          onClick: () => {
            toast.info(`Language changed to ${languageName}, code preserved`);
          },
        },
      });
    }

    // Always update the language
    setLanguage(newLanguage);
  };

  // Handle inline completion toggle with notification
  const handleInlineCompletionToggle = () => {
    const newState = !inlineCompletionsEnabled;
    setInlineCompletionsEnabled(newState);

    if (newState) {
      toast.success("✨ AI Inline Completions Enabled", {
        description: "Start typing to see AI suggestions",
        duration: 3000,
      });
    } else {
      toast.info("🔇 AI Inline Completions Disabled", {
        description: "You can re-enable them anytime",
        duration: 3000,
      });
    }
  };

  const handleCodeModification = async () => {
    if (!aiAssistantEnabled || !promptInput.trim() || !editorRef.current)
      return;

    setIsModifying(true);
    try {
      const currentCode = editorRef.current.getValue();

      const response = await axios.post("/chat-code-modification", {
        message: promptInput,
        currentCode: currentCode,
        language: language,
        userId: user?.id,
      });

      if (response.data && response.data.modifiedCode) {
        if (response.data.unchanged) {
          toast.info(
            response.data.message ||
              "No changes were made to the code. Try being more specific.",
            {
              duration: 4000,
              description:
                "The AI didn't find any modifications to make based on your request.",
            }
          );
        } else {
          const newCode = response.data.modifiedCode;
          const editor = editorRef.current;
          const model = editor.getModel();

          const originalPosition = editor.getPosition();
          model.setValue("");

          // Animate typing the new code
          const tokens = newCode.match(/[\w]+|[^\w\s]|\s+/g) || [];
          let currentText = "";
          const baseDelay = 10;
          const variationFactor = 0.1;

          for (let i = 0; i < tokens.length; i++) {
            currentText += tokens[i];
            model.setValue(currentText);
            editor.focus();
            editor.revealPositionInCenter({
              lineNumber: model.getLineCount(),
              column: model.getLineMaxColumn(model.getLineCount()),
            });

            const randomVariation =
              1 - variationFactor / 2 + Math.random() * variationFactor;
            const delay = baseDelay * randomVariation * (tokens[i].length || 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          if (originalPosition) {
            editor.setPosition(originalPosition);
          }

          setCode(newCode);

          // Show success toast
          toast.success("Code Modified Successfully!", {
            description: "Your code has been updated with AI modifications.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error modifying code:", error);
      let errorMessage = "Failed to modify code. Please try again.";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      toast.error("Code Modification Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsModifying(false);
      setShowPromptModal(false);
      setPromptInput("");
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      const cleanup = handleEditorDidMount(editorRef.current, window.monaco);
      const model = editorRef.current.getModel();
      if (model) {
        window.monaco.editor.setModelLanguage(model, language);
      }
      return () => cleanup();
    }
  }, [language, inlineCompletionsEnabled, aiAssistantEnabled]);

  // Load default JavaScript boilerplate on component mount
  useEffect(() => {
    // Check if code is empty and load default JavaScript boilerplate
    if (!code || code.trim() === "") {
      const defaultBoilerplate = getBoilerplateCode("javascript");
      setCode(defaultBoilerplate);
      localStorage.setItem("code", defaultBoilerplate);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M") {
        e.preventDefault();
        if (aiAssistantEnabled) {
          setShowPromptModal(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [aiAssistantEnabled]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-lg font-semibold text-gray-500 dark:text-gray-300 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      key={`editor-${sidebarOpen}-${outputSidebarOpen}`} // Force re-render when sidebar states change
      className={`h-full flex flex-col transition-all duration-1000 ease-in-out ${
        sidebarOpen && outputSidebarOpen
          ? "pr-96" // Fallback class for both sidebars (will be overridden by inline style)
          : sidebarOpen || outputSidebarOpen
          ? "pr-96" // One sidebar open: 384px
          : "pr-20" // No sidebars open: 80px
      }`}
      style={{
        paddingRight:
          sidebarOpen && outputSidebarOpen
            ? "768px" // Both sidebars open: 384px + 384px
            : sidebarOpen || outputSidebarOpen
            ? "384px" // One sidebar open: 384px
            : "80px", // No sidebars open: 80px
        transition: "padding-right 1s ease-in-out",
      }}
    >
      {/* Enhanced Editor Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 px-4 pt-4">
        {/* Language Selector with Enhanced Styling */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl border transition-all duration-300 text-sm font-medium shadow-lg transform hover:scale-105 ${
              theme === "dark"
                ? "bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-slate-600/50 text-white hover:from-slate-700 hover:to-slate-800 hover:border-slate-600/70 shadow-slate-900/25"
                : "bg-gradient-to-r from-white/80 to-gray-50/80 border-gray-300/50 text-gray-900 hover:from-white hover:to-gray-100 hover:border-gray-400/70 shadow-gray-900/10"
            }`}
          >
            {(() => {
              const currentLang = languages.find(
                (lang) => lang.id === language
              );
              const IconComponent = currentLang?.icon;
              return (
                <>
                  {IconComponent && (
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: currentLang.color }}
                    />
                  )}
                  <span>{currentLang?.name}</span>
                  <RiArrowDownSLine
                    className={`w-4 h-4 transition-transform ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              );
            })()}
          </button>

          {isLanguageOpen && (
            <div
              className={`absolute top-full mt-2 w-full rounded-xl border shadow-2xl z-30 backdrop-blur-xl ${
                theme === "dark"
                  ? "bg-gradient-to-b from-slate-700/95 to-slate-800/95 border-slate-600/50"
                  : "bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-300/50"
              }`}
            >
              {languages.map((lang) => {
                const IconComponent = lang.icon;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      handleLanguageChange(lang.id);
                      setIsLanguageOpen(false);
                    }}
                    className={`w-full text-left flex items-center space-x-3 px-6 py-3 hover:bg-opacity-10 transition-all duration-300 text-sm rounded-lg mx-1 my-1 ${
                      theme === "dark"
                        ? "text-white hover:bg-white/10"
                        : "text-gray-900 hover:bg-gray-900/10"
                    } ${
                      language === lang.id
                        ? "font-semibold bg-emerald-500/20 border border-emerald-500/30"
                        : ""
                    }`}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: lang.color }}
                    />
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Control Panel */}
        <div className="flex items-center space-x-4">
          {/* Debug: Show sidebar state */}
          {/* <div
            className={`text-xs px-2 py-1 rounded ${
              theme === "dark"
                ? "bg-slate-700 text-slate-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            AI Sidebar: {sidebarOpen ? "Open" : "Closed"} | Output Sidebar: {outputSidebarOpen ? "Open" : "Closed"}
          </div> */}

          {/* Font Size Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className={`p-2 rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50"
              }`}
              title="Decrease Font Size"
            >
              <RiZoomOutLine className="w-4 h-4" />
            </button>
            <span
              className={`text-sm font-medium px-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className={`p-2 rounded-lg transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-300 border border-slate-600/50"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-600 border border-gray-300/50"
              }`}
              title="Increase Font Size"
            >
              <RiZoomInLine className="w-4 h-4" />
            </button>
          </div>

          {/* Inline Completion Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInlineCompletionToggle}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                inlineCompletionsEnabled
                  ? theme === "dark"
                    ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20"
                  : theme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-700/70 text-gray-400 border border-slate-600/50"
                  : "bg-gray-200/50 hover:bg-gray-200/70 text-gray-500 border border-gray-300/50"
              }`}
              title={`${
                inlineCompletionsEnabled ? "Disable" : "Enable"
              } Inline Completions`}
            >
              {inlineCompletionsEnabled ? (
                <RiToggleFill className="w-4 h-4" />
              ) : (
                <RiToggleLine className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">AI Completion</span>
            </button>
          </div>

          {/* AI Modify Button */}
          {/* <button
            onClick={() => setShowPromptModal(true)}
            disabled={!aiAssistantEnabled}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
              aiAssistantEnabled
                ? theme === "dark"
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30 shadow-blue-500/10"
                  : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-500/20 shadow-blue-500/10"
                : theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 cursor-not-allowed"
                : "bg-gray-300/50 text-gray-600 border border-gray-400/50 cursor-not-allowed"
            }`}
            title="Modify Code with AI (Ctrl+Shift+M)"
          >
            <RiMagicLine className="w-4 h-4" />
            <span>AI Modify</span>
          </button> */}

          {/* Quick Save or Sign in to Save button */}
          {user ? (
            <>
              <button
                onClick={handleOpenSaveModal}
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
              {/* Save Modal */}
              {showSaveModal && (
                <div
                  className={`fixed inset-0 z-50 flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-black/60 backdrop-blur-sm"
                      : "bg-slate-900/40 backdrop-blur-sm"
                  }`}
                >
                  <div
                    className={`rounded-2xl shadow-2xl p-8 w-full max-w-md border backdrop-blur-xl ${
                      theme === "dark"
                        ? "bg-slate-800/95 border-slate-700/50"
                        : "bg-white/95 border-gray-200/50"
                    }`}
                  >
                    <h2
                      className={`text-xl font-bold mb-2 text-center ${
                        theme === "dark" ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Save Code Snippet
                    </h2>
                    <div
                      className={`text-center mb-4 ${
                        theme === "dark" ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      <span className="text-sm">Saving as </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          theme === "dark"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        }`}
                      >
                        {languages.find((l) => l.id === language)?.name ||
                          language.toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          theme === "dark" ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        File Name*
                      </label>
                      <input
                        type="text"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                            : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-emerald-500/50"
                        }`}
                        placeholder="e.g., my-awesome-script, calculator-app"
                        autoFocus
                        maxLength={100}
                      />
                      {saveTitle.length > 0 && (
                        <div
                          className={`text-xs mt-1 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-gray-500"
                          }`}
                        >
                          {saveTitle.length}/100 characters
                        </div>
                      )}
                    </div>
                    <div className="mb-6">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          theme === "dark" ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        Description
                      </label>
                      <textarea
                        value={saveDescription}
                        onChange={(e) => setSaveDescription(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-emerald-500/50"
                            : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-emerald-500/50"
                        }`}
                        placeholder="Brief description of what this code does (optional)"
                        rows={3}
                        maxLength={500}
                      />
                      {saveDescription.length > 0 && (
                        <div
                          className={`text-xs mt-1 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-gray-500"
                          }`}
                        >
                          {saveDescription.length}/500 characters
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowSaveModal(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                            : "bg-gray-200/50 text-gray-700 hover:bg-gray-200/70 border border-gray-300/50"
                        }`}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!saveTitle.trim() || saving}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                          !saveTitle.trim() || saving
                            ? theme === "dark"
                              ? "bg-emerald-800/50 text-emerald-300/50 cursor-not-allowed border border-emerald-700/50"
                              : "bg-emerald-300/50 text-emerald-700/50 cursor-not-allowed border border-emerald-400/50"
                            : theme === "dark"
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-500/25"
                            : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
                        }`}
                      >
                        {saving ? (
                          <span className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </span>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <SignInButton mode="modal">
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-white ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                }`}
                title="Sign in to save your code"
              >
                <RiSaveLine className="w-4 h-4" />
                <span>Sign in to Save</span>
              </button>
            </SignInButton>
          )}

          {/* AI Status Indicator */}
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
              inlineCompletionsEnabled && aiAssistantEnabled
                ? theme === "dark"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20 shadow-emerald-500/10"
                : theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                : "bg-gray-300/50 text-gray-600 border border-gray-400/50"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isGenerating
                  ? "bg-yellow-400 animate-pulse"
                  : inlineCompletionsEnabled && aiAssistantEnabled
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            {/* <span>
              {isGenerating
                ? "Generating..."
                : inlineCompletionsEnabled && aiAssistantEnabled
                ? "AI Copilot Active"
                : "AI Copilot Off"}
            </span> */}
          </div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      {(inlineCompletionsEnabled || isGenerating) && (
        <div
          className={`flex items-center justify-between px-4 py-2 mb-3 rounded-xl text-xs shadow-lg ${
            theme === "dark"
              ? "bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
              : "bg-gray-50/50 border border-gray-200/50 backdrop-blur-sm"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                isGenerating
                  ? "bg-yellow-400 animate-pulse"
                  : inlineCompletionsEnabled
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <span
              className={theme === "dark" ? "text-slate-300" : "text-gray-600"}
            >
              {isGenerating
                ? "AI is thinking..."
                : inlineCompletionsEnabled
                ? "AI Copilot is watching your code"
                : "AI Copilot is disabled"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={theme === "dark" ? "text-slate-400" : "text-gray-500"}
            >
              Press Tab to accept suggestions
            </span>
            <kbd
              className={`px-2 py-1 rounded border text-xs ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-slate-300"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              Ctrl+Shift+M
            </kbd>
          </div>
        </div>
      )}

      {/* Enhanced Monaco Editor */}
      <div
        className={`flex-1 rounded-xl overflow-hidden min-h-0 mx-4 mb-4 shadow-xl ${
          theme === "dark"
            ? "border border-gray-600/50"
            : "border border-gray-300/50"
        }`}
      >
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 24, bottom: 24 },
            fontFamily:
              "JetBrains Mono, 'Cascadia Code', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            inlineSuggest: {
              enabled: inlineCompletionsEnabled && aiAssistantEnabled,
              mode: "subword",
              showToolbar: "always",
              suppressSuggestions: false,
            },
            suggest: {
              preview: true,
              previewMode: "subword",
              showInlineDetails: true,
              insertMode: "replace",
              snippetsPreventQuickSuggestions: false,
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            insertMode: "replace",
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            suggestSelection: "first",
            suggestOnTriggerCharacters: true,
            tabFocusMode: false,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            mouseWheelZoom: true,
          }}
        />
      </div>

      {/* Enhanced AI Code Modification Modal */}
      {showPromptModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${
            theme === "dark"
              ? "bg-black/80 backdrop-blur-sm"
              : "bg-slate-900/50 backdrop-blur-sm"
          }`}
        >
          <div
            className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              theme === "dark"
                ? "bg-slate-800/95 border-slate-700/50"
                : "bg-white/95 border-gray-200/50"
            }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`p-3 rounded-xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30"
                    : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20"
                }`}
              >
                <RiMagicLine
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-white" : "text-slate-800"
                  }`}
                >
                  AI Code Modification
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Describe the changes you want to make
                </p>
              </div>
            </div>

            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="E.g., Add error handling to this function, Convert to async/await syntax, Add comments explaining the logic..."
              className={`w-full p-4 rounded-xl border mb-6 text-sm resize-none shadow-lg ${
                theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:border-blue-500/50"
                  : "bg-white/50 border-gray-300/50 text-slate-800 placeholder-slate-500 focus:bg-white/70 focus:border-blue-500/50"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300`}
              rows={4}
              autoFocus
            />

            <div className="flex items-center justify-between mb-6">
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-gray-500"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>Keyboard shortcut:</span>
                  <kbd
                    className={`px-2 py-1 rounded border ${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-slate-300"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
                    Ctrl+Shift+M
                  </kbd>
                </span>
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-500" : "text-gray-400"
                }`}
              >
                {promptInput.length}/500 characters
              </div>
            </div>

            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setShowPromptModal(false)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-200/70 border border-gray-300/50"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleCodeModification}
                disabled={!promptInput.trim() || isModifying}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  !promptInput.trim() || isModifying
                    ? theme === "dark"
                      ? "bg-blue-800/50 text-blue-300/50 cursor-not-allowed border border-blue-700/50"
                      : "bg-blue-300/50 text-blue-700/50 cursor-not-allowed border border-blue-400/50"
                    : theme === "dark"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25"
                }`}
              >
                {isModifying ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  "Apply Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
