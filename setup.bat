@echo off
echo 🚀 Setting up your AI Code Editor with GitHub Copilot-style features...
echo.

:: Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🔧 To get started:
echo 1. Make sure you have an OpenRouter API key in .env file
echo 2. Run 'npm run dev:all' to start both frontend and backend
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🎯 Features:
echo - ✨ Real-time AI inline completions (like GitHub Copilot)
echo - 🧠 AI code explanations
echo - 💡 AI code suggestions
echo - 🎨 Beautiful futuristic UI with dark/light mode
echo - ⚡ Fast, debounced AI requests
echo - 🔄 Auto-save functionality
echo.
echo Press Tab to accept inline suggestions!
echo Press Ctrl+I to toggle AI Copilot on/off
echo.
pause
