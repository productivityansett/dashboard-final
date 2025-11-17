import React from 'react';

interface TabsProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            ${
                                tab === activeTab
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                            }
                            whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
};