import { supabase } from './supabaseClient';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Users, Clock, AlertCircle, Calendar, Plus, Download, Sparkles, Trash2, CheckCircle, Building2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

enum Department {
  DATA_MANAGEMENT = 'Data Management',
  ACCOUNTS_FINANCE = 'Accounts/Finance',
  ADMIN_HR = 'Admin/HR',
  IT = 'IT',
  HSE = 'HSE',
  PROCUREMENT = 'Procurement',
  MAINTENANCE = 'Maintenance',
  JANITORIAL = 'Janitorial',
  INVENTORY = 'Inventory',
  CORING_WELLSITE = 'Coring/Wellsite',
  ISO = 'Iso',
  ENVIRONMENTAL = 'Environmental',
  RECEPTION = 'Reception',
  CT_IMAGING_GAMMA = 'CT/Imaging/Gamma',
  ROCKSHOP = 'Rockshop',
  PVT_GC = 'PVT/GC',
  SCAL_ROUTINE = 'Scal/Routine',
  BUSINESS_DEVELOPMENT = 'Business Development',
  SECURITY = 'Security',
}

enum TaskCategory {
  MAINTENANCE = 'Maintenance',
  CONTRACT_TENDER = 'Contract/Tender',
  SUPERVISION = 'Supervision',
  INVENTORY = 'Inventory',
  TRAINING = 'Training',
  REPORTING = 'Reporting',
  IT = 'IT',
  ADMIN = 'Admin',
  INVOICE = 'Invoice',
  PROCUREMENT = 'Procurement',
  HOUSE_KEEPING = 'House Keeping',
  ACCOUNTS_FINANCE = 'Accounts/Finance',
  HR = 'HR',
}

enum TaskStatus {
  COMPLETE = 'Complete',
  IN_PROGRESS = 'In Progress',
  INCOMPLETE = 'Incomplete',
}

interface ProductivityLog {
  id: string;
  employeeName: string;
  employeeId: string;
  department: Department;
  date: string;
  taskCategory: TaskCategory;
  taskDescription: string;
  taskStatus: TaskStatus;
  hours: number;
  productivityRating: number;
  blockers: string;
  tasksCarriedOver?: string;
}

interface TaskItem {
  id: string;
  taskDescription: string;
  taskCategory: TaskCategory;
  taskStatus: TaskStatus;
}

interface DailyLogSubmission {
  employeeName: string;
  employeeId: string;
  department: Department;
  date: string;
  hours: number;
  productivityRating: number;
  blockers: string;
  tasksCarriedOver?: string;
  tasks: TaskItem[];
}

const StorageService = {
  async getLogs(): Promise<ProductivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(log => ({
        id: log.id,
        employeeName: log.employee_name,
        employeeId: log.employee_id,
        department: log.department as Department,
        date: log.date,
        taskCategory: log.task_category as TaskCategory,
        taskDescription: log.task_description,
        taskStatus: log.task_status as TaskStatus,
        hours: parseFloat(log.hours),
        productivityRating: log.productivity_rating,
        blockers: log.blockers || '',
        tasksCarriedOver: log.tasks_carried_over || ''
      }));
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  },

  async saveLog(log: ProductivityLog): Promise<void> {
    try {
      const { error } = await supabase
        .from('productivity_logs')
        .insert({
          id: log.id,
          employee_name: log.employeeName,
          employee_id: log.employeeId,
          department: log.department,
          date: log.date,
          task_category: log.taskCategory,
          task_description: log.taskDescription,
          task_status: log.taskStatus,
          hours: log.hours,
          productivity_rating: log.productivityRating,
          blockers: log.blockers || null,
          tasks_carried_over: log.tasksCarriedOver || null
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving log:', error);
      throw error;
    }
  },

  async getInsights(): Promise<string | null> {
    try {
      return localStorage.getItem('ai_insights');
    } catch (error) {
      return null;
    }
  },

  async saveInsights(insights: string): Promise<void> {
    try {
      localStorage.setItem('ai_insights', insights);
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }
};

const AIService = {
  async generateInsights(logs: ProductivityLog[]): Promise<string> {
    try {
      // Call our Netlify function
      const response = await fetch('/.netlify/functions/generateInsights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      return data.insights;

    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate insights. Please try again.');
    }
  }
};

const useProductivityData = (filters: any) => {
  const [logs, setLogs] = useState<ProductivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const loadedLogs = await StorageService.getLogs();
    setLogs(loadedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

    const addLog = useCallback(async (submission: DailyLogSubmission) => {
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

  // Save each log to Supabase
  for (const log of newLogs) {
    await StorageService.saveLog(log);
  }

  // Reload logs from database
  await loadLogs();
}, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      if (filters.department && log.department !== filters.department) return false;
      if (filters.employee && log.employeeName !== filters.employee) return false;
      return true;
    });
  }, [logs, filters]);

  const kpiData = useMemo(() => {
    const WORK_HOURS_PER_DAY = 8;
    
    const calculateUtilization = (scopedLogs: ProductivityLog[]): number => {
      if (scopedLogs.length === 0) return 0;
      const totalHoursLogged = scopedLogs.reduce((acc, log) => acc + log.hours, 0);
      const employeeWorkDays: Record<string, Set<string>> = {};
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

    const totalTasks = filteredLogs.length;
    const completedTasks = filteredLogs.filter(log => log.taskStatus === TaskStatus.COMPLETE).length;
    const totalHours = filteredLogs.reduce((acc, log) => acc + log.hours, 0);

    const departmentalPerformance = Object.values(Department).map(dept => {
      const deptLogs = filteredLogs.filter(log => log.department === dept);
      const deptTotalTasks = deptLogs.length;
      const deptCompletedTasks = deptLogs.filter(log => log.taskStatus === TaskStatus.COMPLETE).length;
      const deptTotalHours = deptLogs.reduce((acc, log) => acc + log.hours, 0);
      
      return {
        department: dept,
        totalTasks: deptTotalTasks,
        completionRate: deptTotalTasks > 0 ? (deptCompletedTasks / deptTotalTasks) * 100 : 0,
        avgTaskDuration: deptTotalTasks > 0 ? deptTotalHours / deptTotalTasks : 0,
        utilizationRate: calculateUtilization(deptLogs),
      };
    }).filter(d => d.totalTasks > 0).sort((a, b) => b.completionRate - a.completionRate);

    const employeeMetrics: Record<string, any> = {};
    filteredLogs.forEach(log => {
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

    const employeeLeaderboard = Object.entries(employeeMetrics).map(([name, data]: [string, any]) => ({
      name,
      completedTasks: data.completedTasks,
      avgTaskDuration: data.logCount > 0 ? data.totalDuration / data.logCount : 0,
      utilizationRate: calculateUtilization(data.logs),
    })).sort((a, b) => b.completedTasks - a.completedTasks).slice(0, 10);

    const dailyTrend = Array.from({ length: 7 }).map((_, i) => {
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

    const statusCounts: Record<string, number> = {
      [TaskStatus.COMPLETE]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.INCOMPLETE]: 0,
    };
    filteredLogs.forEach(log => {
      statusCounts[log.taskStatus]++;
    });
    const taskStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    let completeForms = 0;
    let missingTime = 0;
    if (totalTasks > 0) {
      filteredLogs.forEach(log => {
        if (log.employeeName && log.employeeId && log.taskDescription && log.hours > 0 && log.productivityRating > 0) {
          completeForms++;
        }
        if (log.hours <= 0) {
          missingTime++;
        }
      });
    }

    const dataQuality = {
      formCompletenessScore: totalTasks > 0 ? (completeForms / totalTasks) * 100 : 100,
      missingTimeEntries: totalTasks > 0 ? (missingTime / totalTasks) * 100 : 0,
    };

    const executiveSummary = {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgTaskDuration: totalTasks > 0 ? totalHours / totalTasks : 0,
      topPerformingDept: departmentalPerformance[0]?.department || 'N/A',
      leastPerformingDept: departmentalPerformance[departmentalPerformance.length - 1]?.department || 'N/A',
      overallUtilizationRate: calculateUtilization(filteredLogs),
    };

    return { executiveSummary, employeeLeaderboard, departmentalPerformance, dailyTrend, taskStatusDistribution, dataQuality };
  }, [filteredLogs, logs]);

  const uniqueValues = useMemo(() => {
    const employees = Array.from(new Set(logs.map(log => log.employeeName))).sort();
    const departments = Object.values(Department).sort();
    return { employees, departments };
  }, [logs]);

  return { logs: filteredLogs, addLog, kpiData, uniqueValues, loading };
};

const Logo = () => (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-4 border-orange-400 relative overflow-hidden">
    <div className="absolute inset-0 bg-blue-800 rounded-full" style={{ clipPath: 'circle(45% at 50% 50%)' }}>
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-white font-bold text-xl">AS</span>
      </div>
    </div>
    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 transform -translate-x-1/2"></div>
  </div>
);

const LogEntryPage: React.FC<{ onSubmit: (submission: DailyLogSubmission) => void; onBack?: () => void }> = ({ onSubmit, onBack }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState('');
  const [productivityRating, setProductivityRating] = useState('');
  const [blockers, setBlockers] = useState('');
  const [tasksCarriedOver, setTasksCarriedOver] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([{ id: crypto.randomUUID(), taskDescription: '', taskCategory: TaskCategory.ADMIN, taskStatus: TaskStatus.IN_PROGRESS }]);
  const [submitted, setSubmitted] = useState(false);

  const addTask = () => {
    setTasks([...tasks, { id: crypto.randomUUID(), taskDescription: '', taskCategory: TaskCategory.ADMIN, taskStatus: TaskStatus.IN_PROGRESS }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof TaskItem, value: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, [field]: value } : task));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeName || !employeeId || !department || !hours || !productivityRating) {
      alert('Please fill in all required fields');
      return;
    }

    const invalidTasks = tasks.filter(task => !task.taskDescription.trim());
    if (invalidTasks.length > 0) {
      alert('Please provide descriptions for all tasks');
      return;
    }

    onSubmit({
      employeeName,
      employeeId,
      department,
      date,
      hours: parseFloat(hours),
      productivityRating: parseInt(productivityRating),
      blockers,
      tasksCarriedOver,
      tasks
    });

    setSubmitted(true);
    setTimeout(() => {
      setEmployeeName('');
      setEmployeeId('');
      setDepartment('');
      setHours('');
      setProductivityRating('');
      setBlockers('');
      setTasksCarriedOver('');
      setTasks([{ id: crypto.randomUUID(), taskDescription: '', taskCategory: TaskCategory.ADMIN, taskStatus: TaskStatus.IN_PROGRESS }]);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-3xl font-bold text-white">Daily Productivity Log</h1>
          </div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
              Back to Dashboard
            </button>
          )}
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg text-green-300 flex items-center gap-3 animate-pulse">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <span className="font-semibold text-lg">✓ Log submitted successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Name *</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Employee ID *</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select Department</option>
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={date}
                max={today}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Hours Worked *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Overall Productivity Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setProductivityRating(rating.toString())}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                      productivityRating === rating.toString()
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">Daily Tasks</h3>
                <p className="text-sm text-slate-400 mt-1">Add each task you worked on today.</p>
              </div>
              <button
                type="button"
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="mb-4 p-4 bg-slate-700 rounded-lg mt-4">
                <div className="flex items-center justify-end mb-3">
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Task Description *</label>
                    <input
                      type="text"
                      value={task.taskDescription}
                      onChange={(e) => updateTask(task.id, 'taskDescription', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Category</label>
                      <select
                        value={task.taskCategory}
                        onChange={(e) => updateTask(task.id, 'taskCategory', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                      >
                        {Object.values(TaskCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Status</label>
                      <select
                        value={task.taskStatus}
                        onChange={(e) => updateTask(task.id, 'taskStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                      >
                        {Object.values(TaskStatus).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tasks Carried Over to Next Day</label>
            <textarea
              value={tasksCarriedOver}
              onChange={(e) => setTasksCarriedOver(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              rows={2}
              placeholder="Tasks pending for tomorrow..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Blockers / Issues</label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Any obstacles or issues faced today..."
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition mx-auto block"
          >
            Submit Daily Log
          </button>
        </form>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string; subtitle?: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, subtitle, icon, onClick }) => {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between shadow-lg ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
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

const Tabs: React.FC<{ tabs: string[]; activeTab: string; setActiveTab: (tab: string) => void }> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-slate-700">
      <nav className="-mb-px flex space-x-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === activeTab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

const GlobalFilters: React.FC<{ uniqueValues: any; filters: any; setFilters: any }> = ({ uniqueValues, filters, setFilters }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, dateRange: { ...prev.dateRange, [name]: value }}));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-start flex-wrap gap-3">
        <select
          name="employee"
          value={filters.employee}
          onChange={handleSelectChange}
          className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
        >
          <option value="">All Employees</option>
          {uniqueValues.employees.map((name: string) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select
          name="department"
          value={filters.department}
          onChange={handleSelectChange}
          className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
        >
          <option value="">All Departments</option>
          {uniqueValues.departments.map((name: string) => <option key={name} value={name}>{name}</option>)}
        </select>
        <input
          type="date"
          name="start"
          value={filters.dateRange.start}
          onChange={handleDateChange}
          className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
        />
        <input
          type="date"
          name="end"
          value={filters.dateRange.end}
          onChange={handleDateChange}
          className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
        />
        <button 
          onClick={filters.handleReset}
          className="py-1.5 px-4 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold rounded-md transition-colors flex-grow sm:flex-grow-0"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const AIInsightsTab: React.FC<{ logs: ProductivityLog[] }> = ({ logs }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCachedInsights();
  }, []);

  const loadCachedInsights = async () => {
    const cached = await StorageService.getInsights();
    if (cached) {
      setInsights(cached);
    }
  };

  const generateInsights = async () => {
    if (logs.length === 0) {
      setError('No data available. Please add logs first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await AIService.generateInsights(logs);
      setInsights(result);
      await StorageService.saveInsights(result);
    } catch (err) {
      setError('Failed to generate insights. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Weekly Insight Generator</h3>
        <p className="text-slate-400 max-w-3xl mx-auto mb-4">
          Leverage AI to analyze productivity data and get strategic recommendations.
        </p>
        <button
          onClick={generateInsights}
          disabled={loading || logs.length === 0}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg mx-auto"
        >
          <Sparkles className="h-5 w-5"/>
          <span>{loading ? 'Analyzing...' : 'Generate Weekly Insight'}</span>
        </button>
      </div>

      {loading && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Analyzing productivity data...</p>
        </div>
      )}
      
      {error && <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">{error}</div>}

      {insights && !loading && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300">
            <div dangerouslySetInnerHTML={{ 
              __html: insights
                .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
                .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/- (.*)/g, '<li class="ml-4 mb-1">• $1</li>')
            }} />
          </div>
          <button onClick={generateInsights} className="w-full mt-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-sm">
            Regenerate Insights
          </button>
        </div>
      )}
    </div>
  );
};

const ExecutiveSummaryTab: React.FC<{ kpiData: any; onCardClick: (title: string) => void }> = ({ kpiData, onCardClick }) => {
  const { executiveSummary, dailyTrend, departmentalPerformance } = kpiData;
  const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#22d3ee', // Sky
  '#a855f7', // Violet
  '#eab308', // Yellow
  '#fb923c', // Orange-light
  '#34d399', // Emerald
  '#fbbf24', // Amber-light
  '#f472b6', // Pink-light
  '#60a5fa'  // Blue-light
];
  const pieData = departmentalPerformance.filter((d: any) => d.totalTasks > 0).map((d: any) => ({ name: d.department, value: d.totalTasks }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Completion Rate"
          value={`${executiveSummary.completionRate.toFixed(1)}%`}
          subtitle={`${executiveSummary.completedTasks} / ${executiveSummary.totalTasks} Tasks`}
          icon={<CheckCircle className="h-8 w-8" />}
          onClick={() => onCardClick('Completion Rate')}
        />
        <KPICard 
          title="Avg. Task Duration"
          value={`${executiveSummary.avgTaskDuration.toFixed(1)} hrs`}
          subtitle="per task"
          icon={<Clock className="h-8 w-8" />}
          onClick={() => onCardClick('Avg. Task Duration')}
        />
        <KPICard 
          title="Overall Utilization"
          value={`${executiveSummary.overallUtilizationRate.toFixed(1)}%`}
          subtitle="across all logs"
          icon={<Users className="h-8 w-8" />}
          onClick={() => onCardClick('Overall Utilization')}
        />
        <KPICard 
          title="Top Department"
          value={executiveSummary.topPerformingDept}
          subtitle="by completion rate"
          icon={<Building2 className="h-8 w-8" />}
          onClick={() => onCardClick('Top Department')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Productivity Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="Total Tasks" stroke="#f97316" strokeWidth={2} />
              <Line type="monotone" dataKey="Completed Tasks" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Workload Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
  <PieChart>
    <Pie 
      data={pieData} 
      cx="50%" 
      cy="50%" 
      outerRadius="80%" 
      fill="#8884d8" 
      dataKey="value" 
      label
    >
      {pieData.map((entry: any, index: number) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '8px', padding: '8px 12px' }} />
    <Legend wrapperStyle={{ fontSize: '12px' }} />
  </PieChart>
</ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const EmployeeAnalysisTab: React.FC<{ kpiData: any; logs: ProductivityLog[] }> = ({ kpiData, logs }) => {
  const COLORS = ['#2563eb', '#1d4ed8', '#059669', '#f97316', '#dc2626', '#9333ea'];
  const getStatusColor = (status: TaskStatus) => {
    if (status === TaskStatus.COMPLETE) return 'bg-green-900/50 text-green-300';
    if (status === TaskStatus.IN_PROGRESS) return 'bg-blue-900/50 text-blue-300';
    return 'bg-yellow-900/50 text-yellow-300';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[450px]">
        <h3 className="text-lg font-semibold text-white mb-4">Employee Leaderboard</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={kpiData.employeeLeaderboard} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={120} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="completedTasks" name="Completed Tasks">
              {kpiData.employeeLeaderboard.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400">Date</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400">Employee</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400">Status</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="border-t border-slate-700/50">
                  <td className="py-3 px-3 text-sm text-slate-300">{log.date}</td>
                  <td className="py-3 px-3 text-sm text-slate-300">{log.employeeName}</td>
                  <td className="py-3 px-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.taskStatus)}`}>
                      {log.taskStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right">{log.hours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DepartmentAnalysisTab: React.FC<{ kpiData: any }> = ({ kpiData }) => {
  const COLORS = ['#2563eb', '#1d4ed8', '#059669', '#f97316', '#dc2626'];
  const sorted = [...kpiData.departmentalPerformance].sort((a: any, b: any) => b.totalTasks - a.totalTasks);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Department Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400">Department</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Tasks</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Completion</th>
                <th className="py-2 px-3 text-sm font-semibold text-slate-400 text-right">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {kpiData.departmentalPerformance.map((dept: any) => (
                <tr key={dept.department} className="border-t border-slate-700/50">
                  <td className="py-3 px-3 text-sm text-slate-300">{dept.department}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right">{dept.totalTasks}</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right">{dept.completionRate.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-sm text-slate-300 text-right">{dept.avgTaskDuration.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
        <h3 className="text-lg font-semibold text-white mb-4">Tasks by Department</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={sorted}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
            <XAxis dataKey="department" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="totalTasks">
              {sorted.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TaskQualityTab: React.FC<{ kpiData: any }> = ({ kpiData }) => {
  const STATUS_COLORS: Record<string, string> = {
    [TaskStatus.COMPLETE]: '#16a34a',
    [TaskStatus.IN_PROGRESS]: '#2563eb',
    [TaskStatus.INCOMPLETE]: '#f97316',
  };
  const pieData = kpiData.taskStatusDistribution;
  const total = pieData.reduce((acc: number, cur: any) => acc + cur.value, 0);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">Task Status Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius="80%" dataKey="value">
                {pieData.map((entry: any) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {pieData.map((item: any) => (
            <div key={item.name} className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: STATUS_COLORS[item.name] }}></span>
                <span className="text-slate-300">{item.name}</span>
              </div>
              <span className="font-semibold text-white">{item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DataQualityTab: React.FC<{ kpiData: any }> = ({ kpiData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Data Quality & Compliance</h3>
        <p className="text-slate-400">Monitor accuracy and completeness of productivity logs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Form Completeness"
          value={`${kpiData.dataQuality.formCompletenessScore.toFixed(1)}%`}
          subtitle="Logs with all fields"
          icon={<CheckCircle className="h-8 w-8" />}
        />
        <KPICard
          title="Missing Time Entries"
          value={`${kpiData.dataQuality.missingTimeEntries.toFixed(1)}%`}
          subtitle="Logs with zero hours"
          icon={<AlertCircle className="h-8 w-8" />}
        />
      </div>
    </div>
  );
};

const DetailModal: React.FC<{ title: string; onClose: () => void; logs: ProductivityLog[]; kpiData: any }> = ({ title, onClose, logs, kpiData }) => {
  const getStatusColor = (status: TaskStatus) => {
    if (status === TaskStatus.COMPLETE) return 'bg-green-900/50 text-green-300';
    if (status === TaskStatus.IN_PROGRESS) return 'bg-blue-900/50 text-blue-300';
    return 'bg-yellow-900/50 text-yellow-300';
  };

  const renderContent = () => {
    switch (title) {
      case 'Completion Rate':
      case 'Avg. Task Duration':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-700">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300">Employee</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300">Task</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Hours</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-sm text-slate-300">{log.employeeName}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{log.taskDescription}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.taskStatus)}`}>
                        {log.taskStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 text-right font-mono">{log.hours.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Overall Utilization':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-700">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300">Employee</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Completed</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Avg Duration</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.employeeLeaderboard.map((emp: any) => (
                  <tr key={emp.name} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-sm text-slate-300 font-medium">{emp.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-300 text-right">{emp.completedTasks}</td>
                    <td className="py-3 px-4 text-sm text-slate-300 text-right">{emp.avgTaskDuration.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-sm text-slate-300 text-right">{emp.utilizationRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Top Department':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-700">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300">Department</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Total Tasks</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Completion</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-300 text-right">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.departmentalPerformance
                  .sort((a: any, b: any) => b.completionRate - a.completionRate)
                  .map((dept: any) => (
                    <tr key={dept.department} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-sm text-slate-300 font-medium">{dept.department}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 text-right">{dept.totalTasks}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 text-right">{dept.completionRate.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-sm text-slate-300 text-right">{dept.avgTaskDuration.toFixed(1)}h</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <p className="text-slate-400">No detailed data available for this metric.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl border border-slate-700 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title} - Detailed View</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {logs.length > 0 ? (
            renderContent()
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No data available for the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC<{ logs: ProductivityLog[]; kpiData: any; uniqueValues: any; onNavigateToLogEntry: () => void; filters: any; setFilters: any }> = ({ logs, kpiData, uniqueValues, onNavigateToLogEntry, filters, setFilters }) => {
  const [activeTab, setActiveTab] = useState('Executive Summary');
  const [detailKpi, setDetailKpi] = useState<string | null>(null);
  const TABS = ['Executive Summary', 'Employee Analysis', 'Department Analysis', 'Task Quality', 'Data Quality', 'Weekly Insight'];

  const handleExport = () => {
    if (logs.length === 0) return alert('No data to export');
    const headers = ['Date', 'Employee', 'ID', 'Department', 'Task', 'Status', 'Hours'];
    const rows = logs.map(log => [log.date, log.employeeName, log.employeeId, log.department, log.taskDescription, log.taskStatus, log.hours]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ais_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleResetFilters = () => {
    setFilters({ dateRange: { start: '', end: '' }, department: '', employee: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">AIS Productivity Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={onNavigateToLogEntry} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
              <Plus size={18} />
              <span className="hidden sm:inline">Add Log</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <GlobalFilters uniqueValues={uniqueValues} filters={{ ...filters, handleReset: handleResetFilters }} setFilters={setFilters} />
        <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div>
          {activeTab === 'Executive Summary' && <ExecutiveSummaryTab kpiData={kpiData} onCardClick={setDetailKpi} />}
          {activeTab === 'Employee Analysis' && <EmployeeAnalysisTab kpiData={kpiData} logs={logs} />}
          {activeTab === 'Department Analysis' && <DepartmentAnalysisTab kpiData={kpiData} />}
          {activeTab === 'Task Quality' && <TaskQualityTab kpiData={kpiData} />}
          {activeTab === 'Data Quality' && <DataQualityTab kpiData={kpiData} />}
          {activeTab === 'Weekly Insight' && <AIInsightsTab logs={logs} />}
        </div>
      </main>

      {detailKpi && <DetailModal title={detailKpi} onClose={() => setDetailKpi(null)} logs={logs} kpiData={kpiData} />}
    </div>
  );
};

const App: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const isAdminView = params.get('view') === 'dashboard';
  const [view, setView] = useState<'dashboard' | 'logEntry'>(isAdminView ? 'dashboard' : 'logEntry');
  const [filters, setFilters] = useState({ dateRange: { start: '', end: '' }, department: '', employee: '' });
  const { logs, addLog, kpiData, uniqueValues, loading } = useProductivityData(filters);

  const handleSubmit = (submission: DailyLogSubmission) => {
    addLog(submission);
    if (isAdminView) {
      setView('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdminView || view === 'logEntry') {
    return <LogEntryPage onSubmit={handleSubmit} onBack={isAdminView ? () => setView('dashboard') : undefined} />;
  }

  return (
    <DashboardPage
      logs={logs}
      kpiData={kpiData}
      uniqueValues={uniqueValues}
      onNavigateToLogEntry={() => setView('logEntry')}
      filters={filters}
      setFilters={setFilters}
    />
  );
};

export default App;