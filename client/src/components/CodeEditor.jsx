"use client"

import { useState, useRef, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { RiArrowDownSLine, RiMagicLine } from "react-icons/ri"
import axios from "axios"
import * as monaco from "monaco-editor"

const CodeEditor = ({ code, setCode, language, setLanguage, theme, onExplain, onAutocomplete }) => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [inlineCompletionsEnabled, setInlineCompletionsEnabled] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState(null)
  const editorRef = useRef(null)
  const debounceRef = useRef(null)

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
    { id: "typescript", name: "TypeScript" },
    { id: "html", name: "HTML" },
    { id: "css", name: "CSS" },
    { id: "json", name: "JSON" },
  ]

  // Debounced inline completion function
  const getInlineCompletion = async (model, position) => {
    if (!inlineCompletionsEnabled || !code.trim()) return null

    try {
      setIsGenerating(true)
      const currentCode = model.getValue()
      const currentLanguage = model.getLanguageId()
      const lineContent = model.getLineContent(position.lineNumber)
      const wordAtPosition = model.getWordAtPosition(position)

      const response = await axios.post("/inline-completion", {
        code: currentCode,
        position: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
        language: currentLanguage,
        lineContent,
        wordAtPosition: wordAtPosition?.word || "",
      })

      setIsGenerating(false)

      const handleSuggestion = (completion) => {
        if (completion && completion.text) {
          setCurrentSuggestion({
            text: completion.text,
            range: completion.range,
          })
          return completion
        }
        setCurrentSuggestion(null)
        return null
      }

      if (response.data && response.data.completion) {
        const completion = {
          text: response.data.completion,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column,
          },
        }
        return handleSuggestion(completion)
      }
      return null
    } catch (error) {
      setIsGenerating(false)
      console.error("Inline completion error:", error)
      return null
    }
  }

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    const disposables = languages.map((lang) =>
      monaco.languages.registerInlineCompletionsProvider(lang.id, {
        triggerCharacters: [".", " ", "(", "{", "[", '"', "'", "_", "="],
        handleDidShowCompletionItem: () => {},
        handleDidPartialAccept: () => {},
        async provideInlineCompletions(model, position, context, token) {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current)
          }

          return new Promise((resolve) => {
            debounceRef.current = setTimeout(async () => {
              if (token.isCancellationRequested) {
                resolve({ items: [] })
                return
              }

              try {
                const completion = await getInlineCompletion(model, position)

                if (!completion || !completion.text) {
                  resolve({ items: [] })
                  return
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
                ]

                resolve({ items })
              } catch (error) {
                console.error("Provider error:", error)
                resolve({ items: [] })
              }
            }, 300)
          })
        },
        freeInlineCompletions() {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current)
          }
        },
      }),
    )

    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        const model = editor.getModel()
        const position = editor.getPosition()

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
            () => null,
          )
          setCurrentSuggestion(null)
          return true
        }
        return false
      },
      "inlineSuggestionVisible",
    )

    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Tab && currentSuggestion) {
        const model = editor.getModel()
        const position = editor.getPosition()

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
          () => null,
        )
        setCurrentSuggestion(null)
        e.preventDefault()
        e.stopPropagation()
      }
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }

  const handleEditorChange = (value) => {
    setCode(value || "")
    localStorage.setItem("code", value || "")
  }

  useEffect(() => {
    if (editorRef.current) {
      const cleanup = handleEditorDidMount(editorRef.current, monaco)
      const model = editorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
      return () => cleanup()
    }
  }, [language, inlineCompletionsEnabled])

  return (
    <div className="h-full flex flex-col">
      {/* Editor Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm border transition-colors ${
              theme === "dark"
                ? "bg-[#3c3c3c] border-[#5a5a5a] text-white hover:bg-[#4a4a4a]"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            <span>{languages.find((lang) => lang.id === language)?.name}</span>
            <RiArrowDownSLine className={`w-4 h-4 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
          </button>

          {isLanguageOpen && (
            <div
              className={`absolute top-full mt-1 w-full rounded border shadow-lg z-20 ${
                theme === "dark" ? "bg-[#3c3c3c] border-[#5a5a5a]" : "bg-white border-gray-300"
              }`}
            >
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id)
                    setIsLanguageOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-opacity-10 transition-colors ${
                    theme === "dark" ? "text-white hover:bg-white" : "text-gray-900 hover:bg-gray-900"
                  } ${language === lang.id ? "font-semibold" : ""}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copilot Status */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInlineCompletionsEnabled(!inlineCompletionsEnabled)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm transition-colors ${
              inlineCompletionsEnabled
                ? theme === "dark"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-500/20 text-green-600"
                : theme === "dark"
                  ? "bg-gray-600/50 text-gray-400"
                  : "bg-gray-300/50 text-gray-600"
            }`}
          >
            <RiMagicLine className={`w-4 h-4 ${isGenerating ? "animate-pulse" : ""}`} />
            <span>{inlineCompletionsEnabled ? "Copilot On" : "Copilot Off"}</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {(inlineCompletionsEnabled || isGenerating) && (
        <div
          className={`flex items-center justify-between px-3 py-2 mb-3 rounded text-xs ${
            theme === "dark" ? "bg-[#3c3c3c] border border-[#5a5a5a]" : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isGenerating ? "bg-yellow-400 animate-pulse" : inlineCompletionsEnabled ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              {isGenerating
                ? "Generating suggestion..."
                : inlineCompletionsEnabled
                  ? "AI Copilot Active"
                  : "AI Copilot Disabled"}
            </span>
          </div>
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
            Press Tab to accept • Ctrl+I to toggle
          </span>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 rounded border overflow-hidden">
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
  )
}

export default CodeEditor
