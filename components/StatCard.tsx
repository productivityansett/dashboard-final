import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, onClick }) => {
  const isClickable = !!onClick;
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between h-full shadow-lg ${isClickable ? 'cursor-pointer transition-transform transform hover:scale-105 hover:shadow-cyan-500/10' : ''}`}
      onClick={onClick}
    >
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="text-blue-500 flex-shrink-0 ml-4">
        {icon}
      </div>
    </div>
  );
};