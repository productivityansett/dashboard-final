export enum Department {
  DATA_MANAGEMENT = 'Data Management',
  ACCOUNTS_FINANCE = 'Accounts/Finance',
  ADMIN_HR = 'Admin/HR',
  IT = 'IT',
  HSE = 'HSE',
  PROCUREMENT = 'Procurement',
  COORDINATION = 'Coordination',
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

export enum TaskCategory {
  MAINTENANCE = 'Maintenance',
  CONTRACT_TENDER = 'Contract/Tender',
  COORDINATION = 'Coordination',
  INVENTORY = 'Inventory',
  TRAINING = 'Training',
  REPORTING = 'Reporting',
  IT = 'IT',
  ADMIN = 'Admin',
  INVOICE = 'Invoice',
  PROCUREMENT = 'Procurement',
  HOUSE_KEEPING = 'House Keeping',
}

export enum TaskStatus {
  COMPLETE = 'Complete',
  IN_PROGRESS = 'In Progress',
  INCOMPLETE = 'Incomplete',
}

export interface ProductivityLog {
  id: string;
  employeeName: string;
  employeeId: string;
  department: Department;
  date: string; // YYYY-MM-DD
  taskCategory: TaskCategory;
  taskDescription: string;
  taskStatus: TaskStatus;
  hours: number;
  productivityRating: number; // 1-5
  blockers: string;
  tasksCarriedOver?: string;
}

// For the multi-task entry form
export interface TaskItem {
    id: string;
    taskDescription: string;
    taskCategory: TaskCategory;
    taskStatus: TaskStatus;
}

export interface DailyLogSubmission {
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


// --- New KPI Interfaces ---

export interface ExecutiveStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgTaskDuration: number;
  topPerformingDept: string;
  leastPerformingDept: string;
  overallUtilizationRate: number;
  reworkRate: number; // Placeholder for now
}

export interface EmployeeStats {
  name: string;
  completedTasks: number;
  avgTaskDuration: number;
  utilizationRate: number;
}

export interface DepartmentStats {
  department: Department;
  totalTasks: number;
  completionRate: number;
  avgTaskDuration: number;
  utilizationRate: number;
}

export interface DailyTrendPoint {
  date: string;
  'Total Tasks': number;
  'Completed Tasks': number;
}

export interface TaskStatusDistributionPoint {
    name: TaskStatus;
    value: number;
}

export interface DataQualityStats {
    formCompletenessScore: number;
    missingTimeEntries: number;
}

export interface KpiData {
  executiveSummary: ExecutiveStats;
  employeeLeaderboard: EmployeeStats[];
  departmentalPerformance: DepartmentStats[];
  dailyTrend: DailyTrendPoint[];
  taskStatusDistribution: TaskStatusDistributionPoint[];
  dataQuality: DataQualityStats;
}