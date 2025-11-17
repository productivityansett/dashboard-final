import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';
import type { DepartmentStats, TaskStatusDistributionPoint, DataQualityStats } from '../types';
import { KPICard } from './StatCard';
import { TaskStatus } from '../types';

interface DepartmentAnalysisTabProps {
  departmentalData: DepartmentStats[];
}

const COLORS = ['#2563eb', '#1d4ed8', '#059669', '#f97316', '#dc2626', '#9333ea', '#6b21a8', '#f59e0b', '#3b82f6', '#e11d48'];

export const DepartmentAnalysisTab: React.FC<DepartmentAnalysisTabProps> = ({ departmentalData }) => {
  const sortedByTasks = [...departmentalData].sort((a,b) => b.totalTasks - a.totalTasks);
  const sortedByCompletion = [...departmentalData].sort((a,b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-6">
       <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Department Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className='border-b border-slate-700'>
              <tr>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400">Department</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Total Tasks</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Completion Rate</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Avg. Duration (hrs)</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentalData.map(dept => (
                <tr key={dept.department} className="border-t border-slate-700/50">
                  <td className="py-3 px-3 text-sm text-slate-300 font-medium">{dept.department}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.totalTasks}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.completionRate.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.avgTaskDuration.toFixed(1)}</td>
                   <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.utilizationRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">
                Tasks by Department
            </h3>
            <ResponsiveContainer width="100%" height="90%">
            <BarChart data={sortedByTasks} margin={{ top: 5, right: 20, left: 5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                <XAxis dataKey="department" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip
                contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="totalTasks" name="Total Tasks">
                    {sortedByTasks.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> )}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>

         <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">
                Completion Rate by Department
            </h3>
            <ResponsiveContainer width="100%" height="90%">
            <BarChart data={sortedByCompletion} margin={{ top: 5, right: 20, left: 5, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                <XAxis dataKey="department" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} unit="%" domain={[0,100]}/>
                <Tooltip
                contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="completionRate" name="Completion Rate (%)">
                    {sortedByCompletion.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> )}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


// --- DATA QUALITY TAB ---

const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
);
const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 2.25c.621 0 1.125.504 1.125 1.125v3.375m-13.5 0V9.375c0-.621.504-1.125 1.125-1.125h3.375m-3.375 0c.621 0 1.125.504 1.125 1.125v3.375" />
    </svg>
);
const ClockAlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 9v.01M12 12v.01M12 15v.01" />
    </svg>
);


interface DataQualityTabProps {
    dataQuality: DataQualityStats;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({ dataQuality }) => {
    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Data Quality & Compliance</h3>
                <p className="text-slate-400 max-w-2xl mx-auto">Ensuring the accuracy of logged data is crucial for generating reliable insights. This section provides metrics to monitor the quality and completeness of productivity logs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KPICard
                    title="Form Completeness Score"
                    value={`${dataQuality.formCompletenessScore.toFixed(1)}%`}
                    subtitle="Logs with all required fields"
                    icon={<CheckBadgeIcon className="h-8 w-8" />}
                />
                <KPICard
                    title="Missing Time Entries"
                    value={`${dataQuality.missingTimeEntries.toFixed(1)}%`}
                    subtitle="Logs with zero hours logged"
                    icon={<ExclamationCircleIcon className="h-8 w-8" />}
                />
                 <KPICard
                    title="Duplicate Log Incidence"
                    value="0.3%"
                    subtitle="Under Development"
                    icon={<DocumentDuplicateIcon className="h-8 w-8" />}
                />
                <KPICard
                    title="Inconsistent Duration"
                    value="0.9%"
                    subtitle="Under Development"
                    icon={<ClockAlertIcon className="h-8 w-8" />}
                />
            </div>
        </div>
    );
};


// --- TASK QUALITY TAB ---

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

interface TaskQualityTabProps {
    taskStatusData: TaskStatusDistributionPoint[];
}

const STATUS_COLORS = {
    [TaskStatus.COMPLETE]: '#16a34a',
    [TaskStatus.IN_PROGRESS]: '#2563eb',
    [TaskStatus.INCOMPLETE]: '#f97316',
};

export const TaskQualityTab: React.FC<TaskQualityTabProps> = ({ taskStatusData }) => {
    const totalTasks = taskStatusData.reduce((acc, cur) => acc + cur.value, 0);
    // FIX: Re-map data to an object literal array to satisfy recharts' type expectations for the Pie component.
    const pieData = taskStatusData.map(item => ({ name: item.name, value: item.value }));

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-2 text-center">Task Outcome & Quality Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius="80%"
                                    innerRadius="50%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {pieData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                />
                                <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                         <h4 className="text-lg font-semibold text-white">Task Status Distribution</h4>
                         <p className="text-slate-400">
                            This chart shows the breakdown of all tasks within the filtered period by their current status.
                         </p>
                         <div className="border-t border-slate-700 pt-4">
                            {taskStatusData.map(item => (
                                <div key={item.name} className="flex justify-between items-center py-2">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: STATUS_COLORS[item.name] }}></span>
                                        <span className="text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-white">{item.value} Tasks ({totalTasks > 0 ? ((item.value / totalTasks) * 100).toFixed(1) : 0}%)</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};