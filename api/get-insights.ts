import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProductivityLog } from "../types";

// export const config = {
//   runtime: "edge",
// };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data: ProductivityLog[] = await request.json();
    
    // Correct SDK initialization
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Generate your prompt based on the data
    const prompt = `Analyze the following productivity logs and provide insights:
    
${JSON.stringify(data, null, 2)}

Please provide:
1. Key productivity patterns
2. Time management insights
3. Recommendations for improvement
4. Notable trends`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ insights: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Error generating insights:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate insights',
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}