import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import axios from "axios";
import { supabase, TABLES } from "../lib/supabase";

// Configure axios base URL
axios.defaults.baseURL = "http://localhost:5000";

export const useAppState = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Code state
  const [code, setCode] = useState(() => {
    return (
      localStorage.getItem("code") ||
      `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
    );
  });

  // Editor state
  const [language, setLanguage] = useState("javascript");
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activePanel, setActivePanel] = useState("explanation");

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [outputSidebarOpen, setOutputSidebarOpen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);

  // Theme effect
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Code persistence effect
  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  // Welcome toast effect
  useEffect(() => {
    if (user) {
      toast.success(
        `Welcome back, ${user.firstName || user.username || "User"}!`
      );
    }
  }, [user]);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Output sidebar toggle
  const toggleOutputSidebar = () => {
    setOutputSidebarOpen(!outputSidebarOpen);
  };

  // AI Assistant toggle
  const toggleAiAssistant = () => {
    setAiAssistantEnabled(!aiAssistantEnabled);
  };

  // Code animation function
  const animateTypingCode = async (codeToType, editorRef) => {
    if (!editorRef || !editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();

    if (!model) {
      setCode(codeToType);
      return;
    }

    model.setValue("");
    const tokens = codeToType.match(/[\w]+|[^\w\s]|\s+/g) || [];
    let currentText = "";
    const baseDelay = 30;
    const variationFactor = 0.5;

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

    setCode(codeToType);
  };

  // Code explanation
  const handleExplainCode = async () => {
    if (!code.trim() || !aiAssistantEnabled) return;

    setIsExplaining(true);
    setActivePanel("explanation");
    setExplanation("");

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Explain this code",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("/explain", { code });
      setExplanation(response.data.explanation);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.explanation,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error explaining code:", error);
      setExplanation(
        "Sorry, I couldn't explain this code right now. Please try again."
      );
      toast.error("Failed to explain code. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  // Code autocomplete
  const handleAutocomplete = async () => {
    if (!code.trim() || !aiAssistantEnabled) return;

    setActivePanel("suggestions");
    setSuggestions([]);

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "Suggest improvements for this code",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("/autocomplete", { code });
      const suggestion = response.data.suggestion;

      setSuggestions([
        {
          code: suggestion,
          description: "AI-generated code suggestion",
        },
      ]);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Here's a suggested improvement:\n\n\`\`\`${language}\n${suggestion}\n\`\`\``,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting autocomplete:", error);
      setSuggestions([
        {
          code: "// Unable to generate suggestion at this time",
          description: "Error generating suggestion",
        },
      ]);
      toast.error("Failed to generate code suggestions. Please try again.");
    }
  };

  // Chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !aiAssistantEnabled) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const isCodeModRequest =
        chatInput.toLowerCase().includes("change") ||
        chatInput.toLowerCase().includes("add") ||
        chatInput.toLowerCase().includes("modify") ||
        chatInput.toLowerCase().includes("update") ||
        chatInput.toLowerCase().includes("create") ||
        chatInput.toLowerCase().includes("implement") ||
        chatInput.toLowerCase().includes("fix") ||
        chatInput.toLowerCase().includes("code");

      if (isCodeModRequest) {
        const response = await axios.post("/chat-code-modification", {
          message: chatInput,
          currentCode: code,
          language: language,
        });

        if (response.data.unchanged) {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.message ||
              "No changes were needed for this code. Try being more specific in your request.",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        } else {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.data.explanation ||
              "I've updated your code based on your request. Here's what I did:\n\n" +
                `\`\`\`${language}\n${response.data.modifiedCode}\n\`\`\``,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);

          const codeEditorComponent = document.querySelector(".monaco-editor");
          if (codeEditorComponent && window.monaco) {
            const editor = window.monaco.editor.getEditors()[0];
            if (editor) {
              await animateTypingCode(response.data.modifiedCode, {
                current: editor,
              });
            } else {
              setCode(response.data.modifiedCode);
            }
          } else {
            setCode(response.data.modifiedCode);
          }
        }
      } else {
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `I understand you're asking about: "${chatInput}". I can help modify your code, explain it, or suggest improvements. Try asking me to add a feature or change something specific in your code.`,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling chat request:", error);
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "Sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      toast.error("Failed to process chat request. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  // Load code
  const handleLoadCode = (loadedCode) => {
    setCode(loadedCode);
    toast.success("Code loaded successfully!");
  };

  // Quick save
  const handleQuickSave = async () => {
    if (!code.trim()) return;

    if (!user) {
      toast.error("Please sign in to save your code!", {
        action: {
          label: "Sign In",
          onClick: () => openSignIn(),
        },
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.USER_CODES)
        .insert({
          title: `Code Snippet ${new Date().toLocaleString()}`,
          description: "Quick saved code snippet",
          code: code,
          language: language,
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      toast.success("Code saved successfully!");
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save code. Please try again.");
    }
  };

  return {
    // State
    theme,
    code,
    language,
    isExplaining,
    explanation,
    suggestions,
    activePanel,
    sidebarOpen,
    outputSidebarOpen,
    chatMessages,
    chatInput,
    isTyping,
    aiAssistantEnabled,
    user,

    // Setters
    setCode,
    setLanguage,
    setExplanation,
    setSuggestions,
    setActivePanel,
    setChatInput,

    // Actions
    toggleTheme,
    toggleSidebar,
    toggleOutputSidebar,
    toggleAiAssistant,
    animateTypingCode,
    handleExplainCode,
    handleAutocomplete,
    handleChatSubmit,
    handleLoadCode,
    handleQuickSave,
  };
};
