import React from 'react';

interface HeaderProps {
  onAddLogClick: () => void;
  onExportClick: () => void;
}

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="50" cy="50" r="48" stroke="#f39200" strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="46" fill="#3b3b98" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="#ed1c24" strokeWidth="6" />
        <text x="27" y="68" fontFamily="Arial, Helvetica, sans-serif" fontSize="50" fontWeight="bold" fill="white" textAnchor="middle">A</text>
        <text x="73" y="68" fontFamily="Arial, Helvetica, sans-serif" fontSize="50" fontWeight="bold" fill="white" textAnchor="middle">S</text>
    </svg>
);


const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ onAddLogClick, onExportClick }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8"/>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              AIS Productivity Dashboard
            </h1>
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-400">Daily Sync</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button
              onClick={onExportClick}
              className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <ArrowDownTrayIcon className="h-5 w-5"/>
              <span className="hidden sm:inline">Export Data</span>
            </button>
            <button
              onClick={onAddLogClick}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5"/>
              <span className="hidden sm:inline">Add Daily Log</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};