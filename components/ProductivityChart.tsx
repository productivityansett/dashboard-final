import React from 'react';
import { KPICard } from './StatCard';
import type { ExecutiveStats, DailyTrendPoint, DepartmentStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';


// --- ICONS ---
const TrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" /></svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25V21" /></svg>
);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.25M15 19.128v-3.863a3.376 3.376 0 0 0-3.375-3.375H9.375a3.376 3.376 0 0 0-3.375 3.375v3.863m0-13.5a3.375 3.375 0 0 1 3.375-3.375h1.5a3.375 3.375 0 0 1 3.375 3.375m-6 0v3.862m0-3.862a3.375 3.375 0 0 0-3.375-3.375H3.375a3.375 3.375 0 0 0-3.375 3.375m19.5 0v3.862m0-3.862a3.375 3.375 0 0 0-3.375-3.375h-1.5a3.375 3.375 0 0 0-3.375 3.375m-6 0v3.862" /></svg>
);


interface ExecutiveSummaryTabProps {
  executiveData: ExecutiveStats;
  dailyTrend: DailyTrendPoint[];
  departmentalData: DepartmentStats[];
  onCardClick: (kpiTitle: string) => void;
}

const COLORS = ['#2563eb', '#1d4ed8', '#059669', '#f97316', '#dc2626', '#9333ea', '#6b21a8', '#f59e0b', '#3b82f6', '#e11d48'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({ executiveData, dailyTrend, departmentalData, onCardClick }) => {
  const pieData = departmentalData.filter(d => d.totalTasks > 0).map(d => ({ name: d.department, value: d.totalTasks }));
  
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
                title="Completion Rate"
                value={`${executiveData.completionRate.toFixed(1)}%`}
                subtitle={`${executiveData.completedTasks} / ${executiveData.totalTasks} Tasks`}
                icon={<CheckBadgeIcon className="h-8 w-8" />}
                onClick={() => onCardClick('Completion Rate')}
            />
            <KPICard 
                title="Avg. Task Duration"
                value={`${executiveData.avgTaskDuration.toFixed(1)} hrs`}
                subtitle="per task"
                icon={<ClockIcon className="h-8 w-8" />}
                onClick={() => onCardClick('Avg. Task Duration')}
            />
            <KPICard 
                title="Overall Utilization"
                value={`${executiveData.overallUtilizationRate.toFixed(1)}%`}
                subtitle="across all logs"
                icon={<UsersIcon className="h-8 w-8" />}
                onClick={() => onCardClick('Overall Utilization')}
            />
            <KPICard 
                title="Top Department"
                value={executiveData.topPerformingDept}
                subtitle="by completion rate"
                icon={<BuildingOfficeIcon className="h-8 w-8" />}
                onClick={() => onCardClick('Top Department')}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Weekly Productivity Trend
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={dailyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="Total Tasks" stroke="#f97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="Completed Tasks" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Workload Distribution by Department
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                             contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px', fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};