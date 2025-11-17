import React, { useState } from 'react';
import { Header } from '../components/Header';
import { DashboardContainer } from '../components/Dashboard';
import { DetailModal } from '../components/DetailModal';
import type { ProductivityLog, KpiData } from '../types';

interface DashboardPageProps {
  logs: ProductivityLog[];
  kpiData: KpiData;
  uniqueValues: { employees: string[], departments: string[] };
  onNavigateToLogEntry: () => void;
  filters: {
    dateRange: { start: string, end: string };
    department: string;
    employee: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    dateRange: { start: string, end: string };
    department: string;
    employee: string;
  }>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ logs, kpiData, uniqueValues, onNavigateToLogEntry, filters, setFilters }) => {
  const [detailKpi, setDetailKpi] = useState<string | null>(null);

  const handleResetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      department: '',
      employee: ''
    });
  };

  const handleExportData = () => {
    if (logs.length === 0) {
      alert("There is no data to export in the current view.");
      return;
    }

    const headers = [
      "ID", "Date", "Employee Name", "Employee ID", "Department", 
      "Task Category", "Task Description", "Task Status", "Hours", 
      "Productivity Rating", "Blockers", "Tasks Carried Over"
    ];

    const escapeCsvCell = (value: string | number | undefined | null): string => {
        const strValue = String(value ?? '');
        if (/[",\n\r]/.test(strValue)) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    };

    const csvRows = [
      headers.join(','),
      ...logs.map(log => {
        const row = [
          log.id,
          log.date,
          escapeCsvCell(log.employeeName),
          escapeCsvCell(log.employeeId),
          log.department,
          log.taskCategory,
          escapeCsvCell(log.taskDescription),
          log.taskStatus,
          log.hours,
          log.productivityRating,
          escapeCsvCell(log.blockers),
          escapeCsvCell(log.tasksCarriedOver)
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `ais_productivity_logs_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <Header onAddLogClick={onNavigateToLogEntry} onExportClick={handleExportData} />
      <main className="p-4 sm:p-6 lg:p-8">
        <DashboardContainer
          logs={logs}
          kpiData={kpiData}
          uniqueValues={uniqueValues}
          filters={{...filters, handleReset: handleResetFilters}}
          setFilters={setFilters}
          onCardClick={setDetailKpi}
        />
      </main>
      {detailKpi && (
        <DetailModal
          kpiTitle={detailKpi}
          onClose={() => setDetailKpi(null)}
          logs={logs}
          kpiData={kpiData}
        />
      )}
    </div>
  );
};

export default DashboardPage;