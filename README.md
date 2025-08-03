# 🚀 AI Code Studio Pro - GitHub Copilot Clone

A futuristic, browser-based code editor with real-time AI inline completions, explanations, and suggestions - powered by **Google Gemini AI** and built with React, Monaco Editor, and Node.js backend.

![AI Code Studio Pro](https://img.shields.io/badge/AI-Powered-brightgreen) ![React](https://img.shields.io/badge/React-19.1.0-blue) ![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-orange) ![Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4) ![Node.js](https://img.shields.io/badge/Node.js-Backend-green)

## ✨ Features

### 🎯 Core Features

- **Real-time AI Inline Completions**: GitHub Copilot-style ghost text suggestions as you type
- **Smart Debouncing**: Optimized API calls with 500ms debounce for smooth performance
- **Tab to Accept**: Press Tab to accept AI suggestions, just like in VS Code
- **Multi-language Support**: JavaScript, Python, Java, C++, TypeScript, HTML, CSS, JSON
- **AI Code Explanations**: Get detailed explanations of your code logic
- **AI Code Suggestions**: Generate alternative implementations and improvements

### 🎨 UI/UX Features

- **Futuristic Design**: Clean, modern interface with glass morphism effects
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Bento Grid Layout**: Organized workspace with resizable panels
- **Real-time Status**: Visual indicators for AI activity and connection status
- **Auto-save**: Automatic code persistence to localStorage
- **Responsive**: Works perfectly on desktop and mobile devices

### ⚡ Technical Features

- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
- **Custom Inline Completions Provider**: Native Monaco API integration
- **REST API Backend**: Node.js/Express server with OpenRouter AI integration
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Performance Optimized**: Efficient rendering and minimal re-renders

## 🛠️ Quick Start

### Prerequisites

- Node.js 16+ installed
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Custom-AI-CodeEditor
npm install
cd client && npm install && cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
OPENROUT_API_KEY=your-openrouter-api-key-here
MONGO_URI=mongodb://localhost:27017/ai-code-studio
```

### 3. Start Development

```bash
# Start both frontend and backend concurrently
npm run dev:all

# Or start them separately:
npm run dev:server  # Backend on :5000
npm run dev:client  # Frontend on :3000
```

### 4. Open & Code!

Navigate to `http://localhost:3000` and start coding with AI assistance!

## 🎮 How to Use

### Inline Completions (Copilot Mode)

1. Start typing in the code editor
2. Wait for the gray ghost text to appear (500ms delay)
3. Press **Tab** to accept the suggestion
4. Press **Escape** to dismiss the suggestion
5. Use **Ctrl+I** to toggle Copilot on/off

### AI Features

- **Explain Code**: Click the "Explain" button for detailed code analysis
- **Get Suggestions**: Click "Suggest" for alternative implementations
- **Language Support**: Use the dropdown to switch between programming languages

### Keyboard Shortcuts

- `Tab` - Accept AI inline completion
- `Ctrl+I` - Toggle AI Copilot on/off
- `Ctrl+S` - Manual save (auto-save is enabled)
- `Ctrl+/` - Toggle line comment

## 🏗️ Architecture

### Backend (`/`)

```
├── controllers/
│   └── openRouterController.js    # AI API request handlers
├── services/
│   └── openrouter.js              # AI service integration
├── routes/
│   └── openRouterRoutes.js        # API route definitions
├── config/
│   └── mongoose/database.js       # Database configuration
└── server.js                      # Express server setup
```

### Frontend (`/client`)

```
├── src/
│   ├── components/
│   │   ├── CodeEditor.jsx         # Monaco editor with AI integration
│   │   ├── AIExplanation.jsx      # Code explanation panel
│   │   ├── AIAutocomplete.jsx     # Suggestions panel
│   │   ├── CodeRunner.jsx         # Code execution panel
│   │   └── BentoCard.jsx          # Reusable card component
│   ├── App.jsx                    # Main application
│   └── main.jsx                   # React entry point
```

## 🔧 API Endpoints

### POST `/explain`

Explains the provided code with detailed analysis.

```json
{
  "code": "function fibonacci(n) { ... }"
}
```

### POST `/autocomplete`

Generates code suggestions and improvements.

```json
{
  "code": "function fibonacci(n) { ... }"
}
```

### POST `/inline-completion`

Provides real-time inline code completions.

```json
{
  "code": "function fibonacci(n) {\n  if (n <= 1) return n;\n  ",
  "position": { "lineNumber": 3, "column": 3 },
  "language": "javascript"
}
```

## 🎨 Customization

### Themes

The app supports custom themes. Modify the theme configuration in `App.jsx`:

```jsx
const [theme, setTheme] = useState("dark"); // or "light"
```

### AI Models

Change the AI model in `services/openrouter.js`:

```javascript
model: "qwen/qwen3-235b-a22b:free", // Replace with your preferred model
```

### Languages

Add new languages in `CodeEditor.jsx`:

```javascript
const languages = [
  { id: "rust", name: "Rust" },
  { id: "go", name: "Go" },
  // ... add more
];
```

## 🚀 Deployment

### Production Build

```bash
cd client
npm run build
cd ..
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
WORKDIR /app/client
RUN npm install && npm run build
WORKDIR /app
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's excellent code editor
- **OpenRouter** - AI model API provider
- **React Icons** - Beautiful icon library
- **Tailwind CSS** - Utility-first CSS framework

## 🐛 Troubleshooting

### Common Issues

**AI completions not working?**

- Check your OpenRouter API key in `.env`
- Ensure the backend server is running on port 5000
- Check browser console for network errors

**Monaco editor not loading?**

- Clear browser cache and reload
- Check if all dependencies are installed correctly

**Slow performance?**

- Adjust debounce timing in `CodeEditor.jsx`
- Consider using a more powerful AI model

## 📊 Performance Metrics

- **First Load**: ~2-3 seconds
- **AI Response Time**: 500ms - 2s (depending on model)
- **Bundle Size**: ~1.2MB (gzipped)
- **Memory Usage**: ~50MB average

---

<div align="center">
  <p>Built with ❤️ by developers, for developers</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
