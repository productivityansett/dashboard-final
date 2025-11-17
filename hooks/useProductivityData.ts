import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockLogs } from '../services/mockData';
import { TaskStatus, Department } from '../types';
import type { ProductivityLog, KpiData, ExecutiveStats, EmployeeStats, DepartmentStats, DailyTrendPoint, TaskStatusDistributionPoint, DataQualityStats, DailyLogSubmission } from '../types';

const WORK_HOURS_PER_DAY = 8;
const LOCAL_STORAGE_KEY = 'ais_productivity_logs';

interface DateRange {
  start: string;
  end: string;
}

export const useProductivityData = (filters: { dateRange: DateRange; department: string; employee: string; }) => {
  const [logs, setLogs] = useState<ProductivityLog[]>(() => {
    try {
      const savedLogsJson = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const userAddedLogs = savedLogsJson ? JSON.parse(savedLogsJson) : [];
      const combined = [...mockLogs, ...userAddedLogs];
      const uniqueLogs = Array.from(new Map(combined.map(log => [log.id, log])).values());
      return uniqueLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error reading logs from localStorage", error);
      return mockLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });

  useEffect(() => {
    try {
      const userAddedLogs = logs.filter(log => !mockLogs.some(mockLog => mockLog.id === log.id));
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userAddedLogs));
    } catch (error) {
      console.error("Error saving logs to localStorage", error);
    }
  }, [logs]);

  const addLog = useCallback((submission: DailyLogSubmission) => {
    const hoursPerTask = submission.tasks.length > 0 ? submission.hours / submission.tasks.length : 0;
    
    const newLogs: ProductivityLog[] = submission.tasks.map(task => ({
      id: crypto.randomUUID(),
      date: submission.date,
      employeeName: submission.employeeName,
      employeeId: submission.employeeId,
      department: submission.department,
      hours: hoursPerTask,
      productivityRating: submission.productivityRating,
      blockers: submission.blockers,
      tasksCarriedOver: submission.tasksCarriedOver,
      taskDescription: task.taskDescription,
      taskCategory: task.taskCategory,
      taskStatus: task.taskStatus,
    }));

    setLogs(prevLogs => [...newLogs, ...prevLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const { dateRange, department, employee } = filters;
      const logDate = new Date(log.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      if (department && log.department !== department) return false;
      if (employee && log.employeeName !== employee) return false;
      
      return true;
    });
  }, [logs, filters]);
  
  const kpiData: KpiData = useMemo(() => {
    const safeLogs = filteredLogs; 

    const calculateUtilization = (scopedLogs: ProductivityLog[]): number => {
      if (scopedLogs.length === 0) return 0;
      const totalHoursLogged = scopedLogs.reduce((acc, log) => acc + log.hours, 0);
      const employeeWorkDays: { [key: string]: Set<string> } = {};
      scopedLogs.forEach(log => {
        if (!employeeWorkDays[log.employeeName]) {
          employeeWorkDays[log.employeeName] = new Set();
        }
        employeeWorkDays[log.employeeName].add(log.date);
      });
      const totalWorkDays = Object.values(employeeWorkDays).reduce((acc, dates) => acc + dates.size, 0);
      const totalAvailableHours = totalWorkDays * WORK_HOURS_PER_DAY;
      return totalAvailableHours > 0 ? (totalHoursLogged / totalAvailableHours) * 100 : 0;
    };
    
    const departmentalPerformance = Object.values(Department).map(dept => {
        const deptLogs = safeLogs.filter(log => log.department === dept);
        const totalTasks = deptLogs.length;
        const completedTasks = deptLogs.filter(log => log.taskStatus === TaskStatus.COMPLETE).length;
        const totalHours = deptLogs.reduce((acc, log) => acc + log.hours, 0);
        
        return {
            department: dept,
            totalTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            avgTaskDuration: totalTasks > 0 ? totalHours / totalTasks : 0,
            utilizationRate: calculateUtilization(deptLogs),
        };
    }).sort((a, b) => b.totalTasks - a.totalTasks);

    const employeeMetrics: { [key: string]: { completedTasks: number; totalDuration: number; logCount: number; logs: ProductivityLog[] } } = {};
    safeLogs.forEach(log => {
        if (!employeeMetrics[log.employeeName]) {
            employeeMetrics[log.employeeName] = { completedTasks: 0, totalDuration: 0, logCount: 0, logs: [] };
        }
        if (log.taskStatus === TaskStatus.COMPLETE) {
            employeeMetrics[log.employeeName].completedTasks++;
        }
        employeeMetrics[log.employeeName].totalDuration += log.hours;
        employeeMetrics[log.employeeName].logCount++;
        employeeMetrics[log.employeeName].logs.push(log);
    });

    const employeeLeaderboard: EmployeeStats[] = Object.entries(employeeMetrics).map(([name, data]) => ({
        name,
        completedTasks: data.completedTasks,
        avgTaskDuration: data.logCount > 0 ? data.totalDuration / data.logCount : 0,
        utilizationRate: calculateUtilization(data.logs),
    })).sort((a, b) => b.completedTasks - a.completedTasks).slice(0, 10);

    const totalTasks = safeLogs.length;
    const completedTasks = safeLogs.filter(log => log.taskStatus === TaskStatus.COMPLETE).length;
    const totalHours = safeLogs.reduce((acc, log) => acc + log.hours, 0);
    const activeDepartments = departmentalPerformance.filter(d => d.totalTasks > 0);
    const sortedDeptsByCompletion = [...activeDepartments].sort((a, b) => b.completionRate - a.completionRate);
    
    const executiveSummary: ExecutiveStats = {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgTaskDuration: totalTasks > 0 ? totalHours / totalTasks : 0,
      topPerformingDept: sortedDeptsByCompletion.length > 0 ? sortedDeptsByCompletion[0].department : 'N/A',
      leastPerformingDept: sortedDeptsByCompletion.length > 0 ? sortedDeptsByCompletion[sortedDeptsByCompletion.length - 1].department : 'N/A',
      overallUtilizationRate: calculateUtilization(safeLogs),
      reworkRate: 0, 
    };
    
    const dailyTrend: DailyTrendPoint[] = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const logsOnDate = logs.filter(log => log.date === dateString);
        const completedOnDate = logsOnDate.filter(log => log.taskStatus === TaskStatus.COMPLETE).length;

        return {
            date: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            'Total Tasks': logsOnDate.length,
            'Completed Tasks': completedOnDate,
        };
    }).reverse();
    
    const statusCounts = {
        [TaskStatus.COMPLETE]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.INCOMPLETE]: 0,
    };
    safeLogs.forEach(log => {
        statusCounts[log.taskStatus]++;
    });
    const taskStatusDistribution: TaskStatusDistributionPoint[] = Object.entries(statusCounts).map(([name, value]) => ({
        name: name as TaskStatus,
        value,
    }));

    const totalLogsCount = safeLogs.length;
    let completeForms = 0;
    let missingTime = 0;
    if (totalLogsCount > 0) {
        safeLogs.forEach(log => {
            if (log.employeeName && log.employeeId && log.taskDescription && log.hours > 0 && log.productivityRating > 0) {
                completeForms++;
            }
            if (log.hours <= 0) {
                missingTime++;
            }
        });
    }

    const dataQuality: DataQualityStats = {
        formCompletenessScore: totalLogsCount > 0 ? (completeForms / totalLogsCount) * 100 : 100,
        missingTimeEntries: totalLogsCount > 0 ? (missingTime / totalLogsCount) * 100 : 0,
    };

    return { executiveSummary, employeeLeaderboard, departmentalPerformance, dailyTrend, taskStatusDistribution, dataQuality };
  }, [filteredLogs, logs]);

  const uniqueValues = useMemo(() => {
    const employees = Array.from(new Set(logs.map(log => log.employeeName))).sort();
    const departments = Object.values(Department).sort();
    return { employees, departments };
  }, [logs]);

  return { logs: filteredLogs, addLog, kpiData, uniqueValues };
};
