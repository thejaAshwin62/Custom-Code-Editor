import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error(
    "Error: API key is missing. Please set the GOOGLE_API_KEY environment variable."
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.3,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const codeCompletionConfig = {
  temperature: 0.1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 150,
  responseMimeType: "text/plain",
};

async function initializeModel(config = generationConfig) {
  try {
    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: config,
    });
    return model;
  } catch (error) {
    console.error("Error fetching generative model:", error);
    throw error;
  }
}

async function fileToGenerativePart(path, mimeType) {
  try {
    const data = await fs.readFile(path);
    return {
      inlineData: {
        data: Buffer.from(data).toString("base64"),
        mimeType,
      },
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Cleaned up temporary file: ${filePath}`);
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
}

// Original image processing function
export async function generateContentFromImageAndText(imagePath, prompt) {
  try {
    const model = await initializeModel();
    const imagePart = await fileToGenerativePart(imagePath, "image/jpeg");

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Clean up the image file after processing
    await cleanupFile(imagePath);

    return response.text();
  } catch (error) {
    // Attempt to clean up even if processing failed
    await cleanupFile(imagePath);
    console.error("Error in generateContentFromImageAndText:", error);
    throw error;
  }
}

// New function for code explanation
export async function explainCode(code) {
  try {
    const model = await initializeModel();

    const prompt = `You are a code analysis expert. Provide clear, precise explanations for each line of code. Focus on:
- Function purpose
- Input/Output behavior
- Key operations
- Important variables
Be direct and concise. No fluff or filler words.

Analyze this code:

${code}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini Code Explanation Error:", error);
    throw new Error("Failed to get code explanation from Gemini");
  }
}

// New function for code suggestions
export async function getCodeSuggestion(code) {
  try {
    const model = await initializeModel();

    const prompt = `You are a code completion AI. Respond ONLY with direct code. No explanations, no markdown, no comments about your thought process. Return ONLY the code completion that would naturally follow from the provided code context.

Complete or improve this code:

${code}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;

    // Clean the response to ensure it's only code
    const suggestion = response
      .text()
      .trim()
      .replace(/^```[^\n]*\n|```$/g, "")
      .replace(/^\s*\/\/.*$/gm, "") // Remove comment lines
      .trim();

    return suggestion;
  } catch (error) {
    console.error("Gemini Code Suggestion Error:", error);
    throw new Error("Failed to get code suggestion from Gemini");
  }
}

// New function for inline code completion
export async function getInlineCompletion(
  code,
  position,
  language = "javascript"
) {
  try {
    const model = await initializeModel(codeCompletionConfig);

    const prompt = `You are an AI code completion assistant like GitHub Copilot. 
          
CRITICAL RULES:
- Respond ONLY with the next few lines of code that should come after the cursor
- NO explanations, NO markdown, NO comments about what you're doing
- Generate natural, contextually appropriate code continuation
- Keep completions short (1-3 lines typically)
- Match the existing code style and indentation
- If the code looks complete, suggest the next logical function/feature
- Language: ${language}

Example:
Input: "function fibonacci(n) {\\n  if (n <= 1) return n;\\n  "
Output: "return fibonacci(n - 1) + fibonacci(n - 2);"

Complete this ${language} code:

${code}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;

    const completion = response.text().trim();

    // Clean any remaining formatting
    return completion
      .replace(/^```[^\n]*\n|```$/g, "")
      .replace(/^\s*\/\/.*$/gm, "") // Remove comment lines
      .trim();
  } catch (error) {
    console.error("Gemini Inline Completion Error:", error);
    throw new Error("Failed to get inline completion from Gemini");
  }
}

// Helper function for general text generation
export async function generateText(prompt, config = generationConfig) {
  try {
    const model = await initializeModel(config);
    const result = await model.generateContent([prompt]);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw new Error("Failed to generate text from Gemini");
  }
}
