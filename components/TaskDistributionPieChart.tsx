import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { EmployeeActivityTable } from './EmployeeActivityTable';
import type { EmployeeStats, ProductivityLog } from '../types';

interface EmployeeAnalysisTabProps {
  employeeData: EmployeeStats[];
  logs: ProductivityLog[];
}

const COLORS = ['#2563eb', '#1d4ed8', '#059669', '#f97316', '#dc2626', '#9333ea', '#6b21a8', '#f59e0b', '#3b82f6', '#e11d48'];


export const EmployeeAnalysisTab: React.FC<EmployeeAnalysisTabProps> = ({ employeeData, logs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[450px]">
        <h3 className="text-lg font-semibold text-white mb-4">
            Employee Leaderboard (by Tasks Completed)
        </h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={employeeData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" horizontal={false}/>
            <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderColor: '#e5e7eb',
                color: '#1f2937',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }}/>
            <Bar dataKey="completedTasks" name="Completed Tasks">
                {employeeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <EmployeeActivityTable logs={logs}/>
    </div>
  );
};