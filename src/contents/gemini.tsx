// geminiReview.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiReview = async (code: string, output: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze the following code and provide a brief explanation and below points in order:
possible fixes, provide corrected code  (Only if the provide code is wrong or incomplete or has errors),
and Performance analysis, optimization suggestions:\n\nCode:\n${code}\n\nExecution Output or Error:\n${output}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Unable to get explanation from Gemini.";
  }
};
