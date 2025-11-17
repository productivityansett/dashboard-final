import React, { useState } from 'react';
import { GlobalFilters } from './InsightsCard';
import { Tabs } from './DataInputModal';
import { ExecutiveSummaryTab } from './ProductivityChart';
import { EmployeeAnalysisTab } from './TaskDistributionPieChart';
import { DepartmentAnalysisTab, DataQualityTab, TaskQualityTab } from './TaskStatusChart';
import { AIInsightsTab } from './AIInsightsTab';
import type { ProductivityLog, KpiData } from '../types';

interface DashboardContainerProps {
  logs: ProductivityLog[];
  kpiData: KpiData;
  uniqueValues: { employees: string[], departments: string[] };
  filters: {
    dateRange: { start: string, end: string };
    department: string;
    employee: string;
    handleReset: () => void;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    dateRange: { start: string, end: string };
    department: string;
    employee: string;
  }>>;
  onCardClick: (kpiTitle: string) => void;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ logs, kpiData, uniqueValues, filters, setFilters, onCardClick }) => {
  const [activeTab, setActiveTab] = useState('Executive Summary');

  const TABS = ['Executive Summary', 'Employee Analysis', 'Department Analysis', 'Task Quality', 'Data Quality', 'Weekly Insight'];

  return (
    <div className="space-y-6">
      <GlobalFilters
        uniqueValues={uniqueValues}
        filters={filters}
        setFilters={setFilters}
      />
      <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div>
        {activeTab === 'Executive Summary' && (
          <ExecutiveSummaryTab 
            executiveData={kpiData.executiveSummary} 
            dailyTrend={kpiData.dailyTrend}
            departmentalData={kpiData.departmentalPerformance}
            onCardClick={onCardClick} 
          />
        )}
        {activeTab === 'Employee Analysis' && <EmployeeAnalysisTab employeeData={kpiData.employeeLeaderboard} logs={logs} />}
        {activeTab === 'Department Analysis' && <DepartmentAnalysisTab departmentalData={kpiData.departmentalPerformance} />}
        {activeTab === 'Task Quality' && <TaskQualityTab taskStatusData={kpiData.taskStatusDistribution} />}
        {activeTab === 'Data Quality' && <DataQualityTab dataQuality={kpiData.dataQuality} />}
        {activeTab === 'Weekly Insight' && <AIInsightsTab logs={logs} />}
      </div>
    </div>
  );
};