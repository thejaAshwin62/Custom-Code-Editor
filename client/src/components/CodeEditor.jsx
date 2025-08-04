"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  RiArrowDownSLine,
  RiSparklingLine,
  RiFlashlightLine,
  RiMagicLine,
} from "react-icons/ri";
import axios from "axios";

const CodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  theme,
  onExplain,
  onAutocomplete,
  aiAssistantEnabled = true,
}) => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [inlineCompletionsEnabled, setInlineCompletionsEnabled] =
    useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
    { id: "typescript", name: "TypeScript" },
    { id: "html", name: "HTML" },
    { id: "css", name: "CSS" },
    { id: "json", name: "JSON" },
  ];

  // Debounced inline completion function
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

      // Update in getInlineCompletion
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
        handleDidShowCompletionItem: () => {
          // Optional: Handle when completion is shown
        },
        handleDidPartialAccept: () => {
          // Optional: Handle when completion is partially accepted
        },
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
          // Cleanup function implementation
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }
        },
      })
    );

    // Improved tab handling
    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        const model = editor.getModel();
        const position = editor.getPosition();

        if (currentSuggestion && currentSuggestion.text) {
          // Insert the suggestion
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
          return true; // Prevent default tab behavior
        }
        return false; // Allow default tab behavior
      },
      "inlineSuggestionVisible"
    );

    // Add direct keyboard handler
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
    // Auto-save to localStorage
    localStorage.setItem("code", value || "");
  };

  useEffect(() => {
    // Re-register provider when language changes
    if (editorRef.current && window.monaco) {
      // Dispose existing providers
      const cleanup = handleEditorDidMount(editorRef.current, window.monaco);

      // Update the model's language
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }

      return () => cleanup();
    }
  }, [language, inlineCompletionsEnabled, aiAssistantEnabled]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Tab" && editorRef.current && currentSuggestion) {
        e.preventDefault();
        const editor = editorRef.current;
        const model = editor.getModel();

        model.pushEditOperations(
          [],
          [
            {
              range: currentSuggestion.range,
              text: currentSuggestion.text,
            },
          ],
          () => null
        );
        setCurrentSuggestion(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentSuggestion]);

  // Add keyboard shortcut for AI code modification
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+M (or Command+Shift+M on Mac) to open the AI modification modal
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

  useEffect(() => {
    if (editorRef.current && currentSuggestion) {
      const editor = editorRef.current;

      const handleSuggestionInsert = (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
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
          }
        }
      };

      editor
        .getDomNode()
        ?.addEventListener("keydown", handleSuggestionInsert, true);

      return () => {
        editor
          .getDomNode()
          ?.removeEventListener("keydown", handleSuggestionInsert, true);
      };
    }
  }, [currentSuggestion]);

  // Function to animate typing code into the editor
  const animateTypingCode = async (codeToType, model, editor) => {
    // Split the code by words and special characters to create a more natural typing effect
    const tokens = codeToType.match(/[\w]+|[^\w\s]|\s+/g) || [];
    let currentText = "";

    // Animation speed configuration
    const baseDelay = 30; // milliseconds between characters
    const variationFactor = 0.5; // randomness in typing speed

    // Create a "typing" effect by progressively adding tokens
    for (let i = 0; i < tokens.length; i++) {
      // Add the current token
      currentText += tokens[i];

      // Update the editor
      model.setValue(currentText);

      // Focus the editor and scroll to the insertion point
      editor.focus();
      editor.revealPositionInCenter({
        lineNumber: model.getLineCount(),
        column: model.getLineMaxColumn(model.getLineCount()),
      });

      // Calculate a slightly random delay to make typing feel more natural
      const randomVariation =
        1 - variationFactor / 2 + Math.random() * variationFactor;
      const delay = baseDelay * randomVariation * (tokens[i].length || 1);

      // Pause before the next token
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  // Function to handle direct code modification
  const handleCodeModification = async () => {
    if (!aiAssistantEnabled || !promptInput.trim() || !editorRef.current)
      return;

    setIsModifying(true);
    try {
      const currentCode = editorRef.current.getValue();

      // Send the current code and the prompt to the backend
      const response = await axios.post("/chat-code-modification", {
        message: promptInput,
        currentCode: currentCode,
        language: language,
      });

      // Update the code in the editor
      if (response.data && response.data.modifiedCode) {
        // Check if the code was actually changed
        if (response.data.unchanged) {
          alert(
            response.data.message ||
              "No changes were made to the code. Try being more specific."
          );
        } else {
          // Instead of immediately setting the code, we'll animate it
          const newCode = response.data.modifiedCode;
          const editor = editorRef.current;
          const model = editor.getModel();

          // Save current position
          const originalPosition = editor.getPosition();

          // Clear the editor
          model.setValue("");

          // Animate typing the new code
          await animateTypingCode(newCode, model, editor);

          // Restore cursor position or put it at a sensible location
          if (originalPosition) {
            editor.setPosition(originalPosition);
          }

          // Set the code state for React's state management
          setCode(newCode);

          // Don't show alert anymore, the animation itself is feedback
          // alert("Code updated successfully!");
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

      alert(errorMessage);
    } finally {
      setIsModifying(false);
      setShowPromptModal(false);
      setPromptInput("");
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 text-sm ${
              theme === "dark"
                ? "bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-slate-600/50 text-white hover:from-slate-700 hover:to-slate-800 hover:border-slate-600/70"
                : "bg-gradient-to-r from-white/80 to-gray-50/80 border-gray-300/50 text-gray-900 hover:from-white hover:to-gray-100 hover:border-gray-400/70"
            }`}
          >
            <span>{languages.find((lang) => lang.id === language)?.name}</span>
            <RiArrowDownSLine
              className={`w-4 h-4 transition-transform ${
                isLanguageOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isLanguageOpen && (
            <div
              className={`absolute top-full mt-2 w-full rounded-xl border shadow-xl z-20 ${
                theme === "dark"
                  ? "bg-gradient-to-b from-slate-700/95 to-slate-800/95 border-slate-600/50 backdrop-blur-xl"
                  : "bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-300/50 backdrop-blur-xl"
              }`}
            >
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-opacity-10 transition-all duration-300 text-sm rounded-lg mx-1 my-1 ${
                    theme === "dark"
                      ? "text-white hover:bg-white/10"
                      : "text-gray-900 hover:bg-gray-900/10"
                  } ${
                    language === lang.id
                      ? "font-semibold bg-emerald-500/20"
                      : ""
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Status Indicator */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPromptModal(true)}
            disabled={!aiAssistantEnabled}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm ${
              aiAssistantEnabled
                ? theme === "dark"
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30"
                  : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border border-blue-500/20 hover:from-blue-500/20 hover:to-indigo-500/20"
                : theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50 cursor-not-allowed"
                : "bg-gray-300/50 text-gray-600 border border-gray-400/50 cursor-not-allowed"
            }`}
            title="Modify Code with AI (Ctrl+Shift+M)"
          >
            <RiMagicLine className="w-4 h-4" />
            <span>Modify Code with AI</span>
          </button>

          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm ${
              inlineCompletionsEnabled && aiAssistantEnabled
                ? theme === "dark"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border border-emerald-500/20"
                : theme === "dark"
                ? "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                : "bg-gray-300/50 text-gray-600 border border-gray-400/50"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isGenerating
                  ? "bg-yellow-400 animate-pulse"
                  : inlineCompletionsEnabled && aiAssistantEnabled
                  ? "bg-emerald-400"
                  : "bg-gray-400"
              }`}
            />
            <span>
              {isGenerating
                ? "Generating..."
                : inlineCompletionsEnabled && aiAssistantEnabled
                ? "AI Active"
                : "AI Off"}
            </span>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 rounded-xl overflow-hidden border min-h-0 shadow-lg">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            fontFamily: "JetBrains Mono, 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            // Inline suggestions settings
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
            // Add these new options
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            suggestSelection: "first",
            suggestOnTriggerCharacters: true,
            tabFocusMode: false,
          }}
        />
      </div>

      {/* AI Code Modification Modal */}
      {showPromptModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            theme === "dark" ? "bg-black/70" : "bg-slate-900/30"
          }`}
        >
          <div
            className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl ${
              theme === "dark"
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              Modify Code with AI
            </h3>

            <p
              className={`mb-4 text-sm ${
                theme === "dark" ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Describe what changes you want to make to the code:
            </p>

            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="E.g., Add error handling to this function, Convert to async/await syntax, etc."
              className={`w-full p-3 rounded-lg border mb-4 ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
              rows={4}
              autoFocus
            />

            <div className="flex justify-between items-center mb-4">
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Keyboard shortcut:{" "}
                <kbd
                  className={`px-1.5 py-0.5 rounded border ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600"
                      : "bg-slate-100 border-slate-300"
                  }`}
                >
                  Ctrl+Shift+M
                </kbd>
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowPromptModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleCodeModification}
                disabled={!promptInput.trim() || isModifying}
                className={`px-4 py-2 rounded-lg ${
                  !promptInput.trim() || isModifying
                    ? theme === "dark"
                      ? "bg-blue-800/50 text-blue-300/50 cursor-not-allowed"
                      : "bg-blue-300/50 text-blue-700/50 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-500 text-white hover:bg-blue-400"
                }`}
              >
                {isModifying ? "Processing..." : "Apply Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
