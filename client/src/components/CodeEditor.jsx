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
}) => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [inlineCompletionsEnabled, setInlineCompletionsEnabled] =
    useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
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
    if (!inlineCompletionsEnabled || !code.trim()) return null;

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
  }, [language, inlineCompletionsEnabled]);

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

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Editor Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${
              theme === "dark"
                ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
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
              className={`absolute top-full mt-2 w-full rounded-lg border shadow-lg z-20 ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600"
                  : "bg-white border-gray-200"
              }`}
            >
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-opacity-10 transition-colors text-sm ${
                    theme === "dark"
                      ? "text-white hover:bg-white"
                      : "text-gray-900 hover:bg-gray-900"
                  } ${language === lang.id ? "font-semibold" : ""}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Action Buttons */}
        <div className="flex space-x-2">
          {/* Inline Completions Toggle */}
          <button
            onClick={() =>
              setInlineCompletionsEnabled(!inlineCompletionsEnabled)
            }
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              inlineCompletionsEnabled
                ? theme === "dark"
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-600"
                : theme === "dark"
                ? "bg-slate-600/50 hover:bg-slate-600/70 text-slate-400"
                : "bg-gray-300/50 hover:bg-gray-300/70 text-gray-600"
            }`}
          >
            <RiMagicLine
              className={`w-4 h-4 ${isGenerating ? "animate-pulse" : ""}`}
            />
            <span className="font-medium hidden sm:inline">
              {inlineCompletionsEnabled ? "Copilot On" : "Copilot Off"}
            </span>
          </button>

          <button
            onClick={onExplain}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              theme === "dark"
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-600"
            }`}
          >
            <RiSparklingLine className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Explain</span>
          </button>

          <button
            onClick={onAutocomplete}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              theme === "dark"
                ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600"
            }`}
          >
            <RiFlashlightLine className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Suggest</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {(inlineCompletionsEnabled || isGenerating) && (
        <div
          className={`flex items-center justify-between px-3 py-2 mb-3 rounded-lg text-xs ${
            theme === "dark"
              ? "bg-slate-800/50 border border-slate-700"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isGenerating
                  ? "bg-yellow-400 animate-pulse"
                  : inlineCompletionsEnabled
                  ? "bg-green-400"
                  : "bg-gray-400"
              }`}
            />
            <span
              className={theme === "dark" ? "text-slate-300" : "text-gray-600"}
            >
              {isGenerating
                ? "Generating suggestion..."
                : inlineCompletionsEnabled
                ? "AI Copilot Active"
                : "AI Copilot Disabled"}
            </span>
          </div>
          <span
            className={theme === "dark" ? "text-slate-400" : "text-gray-500"}
          >
            Press Tab to accept • Ctrl+I to toggle
          </span>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 rounded-lg overflow-hidden border border-opacity-20 min-h-0">
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
            padding: { top: 16, bottom: 16 },
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
              enabled: inlineCompletionsEnabled,
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
    </div>
  );
};

export default CodeEditor;
