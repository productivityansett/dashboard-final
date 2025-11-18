const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { logs } = JSON.parse(event.body);

    if (!logs || logs.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No logs provided' })
      };
    }

    // Prepare data for AI analysis
    const simplifiedData = logs.slice(0, 100).map(({ 
      employeeName, department, taskCategory, taskStatus, 
      hours, productivityRating, blockers 
    }) => ({
      employeeName,
      department,
      taskCategory,
      taskStatus,
      hours,
      productivityRating,
      blockers: blockers || 'None'
    }));

    const prompt = `You are a senior business analyst reviewing productivity logs for a corporate team.
Based on the following ${logs.length} productivity log entries, provide a comprehensive analysis in markdown format.

Your analysis must include:
1. **Executive Summary:** High-level overview of team performance and business impact
2. **Productivity Trends:** Key patterns in task completion, time allocation, and department performance
3. **Blocker Analysis:** Common obstacles and their impact on productivity
4. **Department Performance:** Identify top-performing and struggling departments with specific metrics
5. **Employee Insights:** Recognition of high performers and areas where support is needed
6. **Actionable Recommendations:** 3-4 specific, implementable suggestions for:
   - Process improvements
   - Resource allocation
   - Employee development
   - Workload balancing

Maintain a strategic, data-driven tone. Be specific with numbers and examples from the data.

Data:
${JSON.stringify(simplifiedData, null, 2)}`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API Error:', errorData);
      throw new Error(`Anthropic API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        insights: data.content[0].text 
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate insights',
        details: error.message 
      })
    };
  }
};