import React from 'react';
import { TaskStatus } from '../types';
import type { ProductivityLog } from '../types';

interface EmployeeActivityTableProps {
  logs: ProductivityLog[];
}

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETE:
      return 'bg-green-900/50 text-green-300';
    // FIX: Corrected typo to use TaskStatus enum.
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-900/50 text-blue-300';
    case TaskStatus.INCOMPLETE:
      return 'bg-yellow-900/50 text-yellow-300';
    default:
      return 'bg-slate-700 text-slate-300';
  }
};

export const EmployeeActivityTable: React.FC<EmployeeActivityTableProps> = ({ logs }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg min-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">
        Filtered Activity Logs
      </h3>
      <div className="overflow-y-auto flex-grow">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-800 z-[1]">
            <tr>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Date</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Employee</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 hidden md:table-cell">Department</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 hidden sm:table-cell">Category</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400">Status</th>
              <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-3 text-sm text-slate-300 whitespace-nowrap">{log.date}</td>
                  <td className="py-3 px-3 text-sm text-slate-300">{log.employeeName}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 hidden md:table-cell">{log.department}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 hidden sm:table-cell">{log.taskCategory}</td>
                  <td className="py-3 px-3 text-sm text-slate-300">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.taskStatus)}`}>
                          {log.taskStatus}
                      </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right font-mono">{log.hours.toFixed(1)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No activity found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};