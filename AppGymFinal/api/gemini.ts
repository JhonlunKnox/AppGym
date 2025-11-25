import { GoogleGenerativeAI } from "@google/generative-ai";

// USA TU API KEY DE EXPO
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);

export async function askGemini(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("❌ Error Gemini:", error);
    return "Error obteniendo respuesta de Gemini.";
  }
}
