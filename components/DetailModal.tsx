import React from 'react';
import { KpiData, ProductivityLog, TaskStatus } from '../types';

interface DetailModalProps {
  kpiTitle: string;
  onClose: () => void;
  logs: ProductivityLog[];
  kpiData: KpiData;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETE:
      return 'bg-green-900/50 text-green-300';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-900/50 text-blue-300';
    case TaskStatus.INCOMPLETE:
      return 'bg-yellow-900/50 text-yellow-300';
    default:
      return 'bg-slate-700 text-slate-300';
  }
};

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


const DetailContent: React.FC<{ kpiTitle: string; logs: ProductivityLog[]; kpiData: KpiData; }> = ({ kpiTitle, logs, kpiData }) => {
  switch (kpiTitle) {
    case 'Completion Rate':
    case 'Avg. Task Duration':
      return (
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-700 z-[1]">
            <tr>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Employee</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Task</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Status</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-700">
                <td className="py-3 px-3 text-sm text-slate-300 whitespace-nowrap">{log.employeeName}</td>
                <td className="py-3 px-3 text-sm text-slate-300">{log.taskDescription}</td>
                <td className="py-3 px-3 text-sm text-slate-300">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.taskStatus)}`}>
                    {log.taskStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{log.hours.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'Overall Utilization':
      return (
        <table className="w-full text-left">
           <thead className="sticky top-0 bg-slate-700 z-[1]">
            <tr>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Employee</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Completed Tasks</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Avg. Duration</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Utilization Rate</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.employeeLeaderboard.map((emp) => (
              <tr key={emp.name} className="border-t border-slate-700">
                <td className="py-3 px-3 text-sm text-slate-300 font-medium">{emp.name}</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{emp.completedTasks}</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{emp.avgTaskDuration.toFixed(1)} hrs</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{emp.utilizationRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'Top Department':
       return (
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-700 z-[1]">
            <tr>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Department</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Total Tasks</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Completion Rate</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Avg. Duration (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.departmentalPerformance
                .sort((a,b) => b.completionRate - a.completionRate)
                .map(dept => (
              <tr key={dept.department} className="border-t border-slate-700">
                <td className="py-3 px-3 text-sm text-slate-300 font-medium">{dept.department}</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.totalTasks}</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.completionRate.toFixed(1)}%</td>
                <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{dept.avgTaskDuration.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
       );
    default:
      return <p>No details available for this metric.</p>;
  }
};

export const DetailModal: React.FC<DetailModalProps> = ({ kpiTitle, onClose, logs, kpiData }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-700 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-bold text-white">{kpiTitle} - Detailed View</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {logs.length > 0 ? (
            <DetailContent kpiTitle={kpiTitle} logs={logs} kpiData={kpiData} />
          ) : (
            <div className="text-center py-8 text-slate-500">
                No data available for the current filters to show details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};