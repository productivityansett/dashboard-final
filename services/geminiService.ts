import { GoogleGenAI } from "@google/genai";
import type { ProductivityLog } from "../types";

const getGeminiAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getProductivityInsights = async (data: ProductivityLog[]): Promise<string> => {
  try {
    const ai = getGeminiAI();
    const model = 'gemini-2.5-flash';

    const simplifiedData = data.slice(0, 50).map(({ employeeName, department, taskCategory, taskStatus, hours, productivityRating, blockers }) => 
        ({ employeeName, department, taskCategory, taskStatus, hours, productivityRating, blockers: blockers || 'None' })
    );

    const prompt = `
      You are a senior business analyst and HR strategist reviewing weekly productivity logs for a corporate team.
      Based on the following data, provide a concise summary in markdown format for leadership.

      The summary must focus on business development and employee management insights. It should include:
      1.  **Executive Summary:** A high-level overview of the team's weekly performance and its impact on business goals.
      2.  **Performance Highlights & Areas for Improvement:** Identify top-performing employees or departments that are driving results. Also, pinpoint potential bottlenecks or areas where productivity is lagging.
      3.  **Strategic Recommendations for Management:** Provide 2-3 clear, actionable recommendations. One should focus on process improvements for business development, and one should focus on employee management (e.g., training needs, recognition, workload balancing).

      Maintain a strategic, data-driven tone. Do not exceed 200 words.

      Data:
      ${JSON.stringify(simplifiedData, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error generating insights from Gemini:", error);
    if (error instanceof Error) {
        return `### AI Insight Generation Failed

An error occurred while trying to connect to the AI service. Please check your API key and network connection.

**Details:**
\`\`\`
${error.message}
\`\`\`
`;
    }
    return "An unknown error occurred while generating AI insights.";
  }
};