import { GoogleGenerativeAI } from "@google/genai";
import type { ProductivityLog } from "../types";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "API Key Missing",
        details: "Set GEMINI_API_KEY in your Vercel environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const data: ProductivityLog[] = await request.json();
    
    // This is the correct way to instantiate using the SDK:
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const simplifiedData = data.slice(0, 50).map((item) => ({
      employeeName: item.employeeName,
      department: item.department,
      taskCategory: item.taskCategory,
      taskStatus: item.taskStatus,
      hours: item.hours,
      productivityRating: item.productivityRating,
      blockers: item.blockers || "None",
    }));

    const prompt = `
      You are a senior business analyst and HR strategist reviewing weekly productivity logs.
      Analyze the data and produce actionable insights:

      Data:
      ${JSON.stringify(simplifiedData, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ insights: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate insights",
        details: error.message ?? String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
