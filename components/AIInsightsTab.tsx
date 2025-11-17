import React, { useState, useCallback } from 'react';
import type { ProductivityLog } from '../types';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

interface AIInsightsTabProps {
  logs: ProductivityLog[];
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
        <span className="text-gray-300">Generating insights...</span>
    </div>
);


export const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ logs }) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateInsights = useCallback(async () => {
    if (logs.length === 0) {
        setError("### No Data Available\n\nThere is no data in the current filtered view to generate insights. Please adjust your filters or add some logs.");
        setInsights('');
        return;
    }
    
    setIsLoading(true);
    setError('');
    setInsights('');

    try {
        const response = await fetch('/api/get-insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logs),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.details || result.error || 'An unknown error occurred on the server.');
        }
        
        setInsights(md.render(result.insights));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const detailedError = `### AI Insight Generation Failed\n\nAn error occurred while trying to connect to the AI service. Please check your API key and network connection.\n\n**Details:**\n\`\`\`\n${errorMessage}\n\`\`\``;
        setError(detailedError);
    } finally {
        setIsLoading(false);
    }
  }, [logs]);

  return (
    <div className="space-y-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Weekly Insight Generator</h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
                Leverage AI to analyze the current filtered data. Get a strategic summary focusing on business development opportunities and actionable employee management advice.
            </p>
            <div className='mt-6'>
                <button
                    onClick={handleGenerateInsights}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 mx-auto"
                >
                    <SparklesIcon className="h-5 w-5"/>
                    <span>{isLoading ? 'Analyzing...' : 'Generate Weekly Insight'}</span>
                </button>
            </div>
        </div>

        {isLoading && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <LoadingSpinner />
            </div>
        )}
        
        {(insights || error) && (
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div 
                    className="prose prose-invert prose-headings:text-blue-400 prose-strong:text-slate-100 text-slate-300 max-w-none"
                >
                    {error ? <div className="bg-red-900/50 p-4 rounded-md text-red-300 whitespace-pre-wrap font-sans">{error}</div> : <div dangerouslySetInnerHTML={{ __html: insights }} />}
                </div>
            </div>
        )}
    </div>
  );
};
