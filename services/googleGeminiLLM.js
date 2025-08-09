import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import * as fs from "fs/promises";
import dotenv from "dotenv";
import { getApiKeyForUser } from "./userApiKeyService.js";

dotenv.config();

const sharedApiKey = process.env.GOOGLE_API_KEY;

if (!sharedApiKey) {
  console.error(
    "Error: Shared API key is missing. Please set the GOOGLE_API_KEY environment variable."
  );
  process.exit(1);
}

const generationConfig = {
  temperature: 0,
  topP: 0.8,
  topK: 20,
  maxOutputTokens: 512,
  responseMimeType: "text/plain",
};

const codeCompletionConfig = {
  temperature: 0,
  topP: 0.8,
  topK: 20,
  maxOutputTokens: 100,
  responseMimeType: "text/plain",
};

const codeModificationConfig = {
  temperature: 0.2, // Slightly higher to allow for creativity in solutions
  topP: 0.8,
  topK: 20,
  maxOutputTokens: 2048, // Higher token limit for full code modifications
  responseMimeType: "text/plain",
};

async function initializeModel(config = generationConfig, userId = null) {
  try {
    // Get the appropriate API key for this user
    const apiKey = await getApiKeyForUser(userId);
    
    if (!apiKey) {
      throw new Error("No API key available. Please set up your API key or ensure the shared key is configured.");
    }

    // Create a new GoogleGenerativeAI instance with the user's API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
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
export async function generateContentFromImageAndText(imagePath, prompt, userId = null) {
  try {
    const model = await initializeModel(generationConfig, userId);
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
export async function explainCode(code, userId = null) {
  try {
    const model = await initializeModel(generationConfig, userId);

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
export async function getCodeSuggestion(code, userId = null) {
  try {
    const model = await initializeModel(generationConfig, userId);

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
  language = "javascript",
  userId = null
) {
  try {
    const model = await initializeModel(codeCompletionConfig, userId);

    const prompt = `You are an AI code completion assistant like GitHub Copilot. 
          
CRITICAL RULES:
- Respond ONLY with the next few lines of code that should come after the cursor
- NO explanations, NO markdown, NO comments about what you're doing
- Generate natural, contextually appropriate code continuation
- Keep completions short (1-3 lines typically)
- Match the existing code style and indentation
- If the code looks complete, suggest the next logical function/feature
- Language: ${language}
- Consider the cursor position and context carefully
- Provide completions that make sense in the current context

Example:
Input: "function fibonacci(n) {\\n  if (n <= 1) return n;\\n  "
Output: "return fibonacci(n - 1) + fibonacci(n - 2);"

Complete this ${language} code at the cursor position:

${code}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;

    const completion = response.text().trim();

    // Clean any remaining formatting and ensure it's just code
    const cleanCompletion = completion
      .replace(/^```[^\n]*\n|```$/g, "")
      .replace(/^\s*\/\/.*$/gm, "") // Remove comment lines
      .replace(/^[A-Za-z\s]*:/, "") // Remove any label prefixes
      .trim();

    // Only return if we have meaningful completion
    if (cleanCompletion && cleanCompletion.length > 0) {
      return cleanCompletion;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Inline Completion Error:", error);
    throw new Error("Failed to get inline completion from Gemini");
  }
}

// Helper function for general text generation
export async function generateText(prompt, config = generationConfig, userId = null) {
  try {
    const model = await initializeModel(config, userId);
    const result = await model.generateContent([prompt]);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw new Error("Failed to generate text from Gemini");
  }
}

// Function for code modification based on user requests
export async function modifyCode(
  message,
  currentCode,
  language = "javascript",
  userId = null
) {
  try {
    // First get the modified code
    const modifiedCodeModel = await initializeModel(codeModificationConfig, userId);
    const codePrompt = `You are an expert AI coding assistant with deep knowledge of ${language}. The user has requested: "${message}".
    
Current code:
\`\`\`${language}
${currentCode}
\`\`\`

TASK: Analyze the current code and the user's request carefully. Based on the request:
1. Understand what specific code changes are needed
2. Implement these changes while preserving the existing code structure and style where appropriate
3. Make your changes harmonize with the existing code (variable naming conventions, formatting, etc.)
4. If adding new functionality, make sure it integrates well with existing code
5. If fixing issues, ensure you address the root cause
6. Follow best practices and idioms specific to the ${language} language
7. Return ONLY the fully modified code - no explanations or comments about your process

IMPORTANT RULES:
- Return ONLY the complete, working code that incorporates the requested changes
- Do NOT include markdown formatting, backticks, or language identifiers
- Do NOT include any explanations of what you did - just the code
- If you cannot make meaningful changes based on the request, return the original code unmodified
- Make sure the code is syntactically correct and would run without errors in ${language}
- For compiled languages like Java or C++, ensure proper imports/includes are present

Return the COMPLETE, MODIFIED CODE (not just the changed parts):`;

    const codeResult = await modifiedCodeModel.generateContent([codePrompt]);
    const codeResponse = await codeResult.response;

    // Clean the response to ensure it's only code
    const modifiedCode = codeResponse
      .text()
      .trim()
      .replace(/^```[^\n]*\n|```$/g, "") // Remove code blocks if any
      .replace(/^[a-zA-Z0-9]+:/g, "") // Remove any prefixes like "JavaScript:" or "Python:"
      .trim();

    // Additional check to make sure we're not returning the same code
    if (modifiedCode.trim() === currentCode.trim()) {
      console.log("No changes made to the code by the AI");
      return { code: currentCode, unchanged: true };
    }

    // Now get an explanation of what changes were made
    const explanationModel = await initializeModel(generationConfig, userId);
    const explanationPrompt = `You are a helpful coding assistant. The user asked for this code change: "${message}".

Original code:
\`\`\`${language}
${currentCode}
\`\`\`

Modified code:
\`\`\`${language}
${modifiedCode}
\`\`\`

Provide a concise explanation of what changes were made to fulfill the user's request. Be specific about what functions or features were added, modified, or fixed. Consider the specific syntax and conventions of the ${language} language in your explanation. Format your response as:

"I've updated your code based on your request. Here's what I did:

[Your explanation here]

\`\`\`${language}
[The full modified code will be added automatically]
\`\`\`"

Your explanation should only be 2-4 sentences and focus on the specific changes made:`;

    const explanationResult = await explanationModel.generateContent([
      explanationPrompt,
    ]);
    const explanationResponse = await explanationResult.response;
    const explanation = explanationResponse.text().trim();

    return {
      code: modifiedCode,
      explanation: explanation,
      unchanged: false,
    };
  } catch (error) {
    console.error("Gemini Code Modification Error:", error);
    throw new Error("Failed to modify code using Gemini");
  }
}
