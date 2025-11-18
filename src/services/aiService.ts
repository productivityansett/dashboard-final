interface ProductivityLog {
  employeeName: string;
  department: string;
  taskCategory: string;
  taskStatus: string;
  hours: number;
  productivityRating: number;
  blockers: string;
}

export const generateInsights = async (logs: ProductivityLog[]): Promise<string> => {
  try {
    // Call our Netlify function instead of Anthropic directly
    const response = await fetch('/.netlify/functions/generateInsights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logs })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate insights');
    }

    const data = await response.json();
    return data.insights;

  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate insights');
  }
};