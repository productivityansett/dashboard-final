
import { Department, TaskCategory, TaskStatus } from '../types';
import type { ProductivityLog } from '../types';

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const createLog = (
  employeeName: string,
  employeeId: string,
  department: Department,
  category: TaskCategory,
  description: string,
  status: TaskStatus,
  hours: number,
  rating: number,
  blockers: string,
  daysAgo: number
): ProductivityLog => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return {
        id: crypto.randomUUID(),
        employeeName,
        employeeId,
        department,
        date: formatDate(date),
        taskCategory: category,
        taskDescription: description,
        taskStatus: status,
        hours,
        productivityRating: rating,
        blockers,
    };
};

export const mockLogs: ProductivityLog[] = [
    createLog('David Shadreck', 'AIS/008', Department.DATA_MANAGEMENT, TaskCategory.CONTRACT_TENDER, 'Finalized submission of Ingentia Energies tender.', TaskStatus.COMPLETE, 8, 5, '', 6),
    createLog('Favour Achumba', 'AIS/004', Department.ACCOUNTS_FINANCE, TaskCategory.INVOICE, 'Worked on EIOSN invoices and submitted to payable.', TaskStatus.COMPLETE, 7.5, 4, 'System slowness and network issue.', 5),
    createLog('Samuel Onyeocha', 'AIS/015', Department.IT, TaskCategory.MAINTENANCE, 'Worked on maintenance of our generator here', TaskStatus.IN_PROGRESS, 6, 3, 'The plumber did not turn up.', 5),
    createLog('Ifeanyichukwu Chibha', 'AIS/014', Department.ADMIN_HR, TaskCategory.REPORTING, 'Documentation of reports as requested.', TaskStatus.COMPLETE, 8, 5, '', 4),
    createLog('Eze Confidence', 'AIS/012', Department.COORDINATION, TaskCategory.COORDINATION, 'Put Aluka through on how to write meeting rep', TaskStatus.IN_PROGRESS, 5, 4, 'Only that the nylon on the doors are loose.', 4),
    createLog('Regina tempe dike', 'AIS/011', Department.JANITORIAL, TaskCategory.HOUSE_KEEPING, 'Cleaning, mopping and sweeping.', TaskStatus.COMPLETE, 8, 5, 'No issues', 3),
    createLog('David Shadreck', 'AIS/008', Department.DATA_MANAGEMENT, TaskCategory.TRAINING, 'Had training on invoicing.', TaskStatus.IN_PROGRESS, 4, 4, '', 3),
    createLog('Favour Achumba', 'AIS/004', Department.ACCOUNTS_FINANCE, TaskCategory.COORDINATION, 'Taking records of inventory.', TaskStatus.COMPLETE, 7, 5, 'No issues', 2),
    createLog('Samuel Onyeocha', 'AIS/015', Department.IT, TaskCategory.IT, 'Troubleshoot network connectivity issues.', TaskStatus.COMPLETE, 8.5, 5, '', 2),
    createLog('Eze Confidence', 'AIS/012', Department.COORDINATION, TaskCategory.ADMIN, 'Assisted HR in updating petty cash book.', TaskStatus.COMPLETE, 6, 4, 'No power to on the computers.', 1),
    createLog('Ifeanyichukwu Chibha', 'AIS/014', Department.ADMIN_HR, TaskCategory.MAINTENANCE, 'Supervised the cleaning done by the janitors.', TaskStatus.COMPLETE, 8.5, 5, '', 1),
    createLog('David Shadreck', 'AIS/008', Department.DATA_MANAGEMENT, TaskCategory.REPORTING, 'Compiled weekly data analysis report.', TaskStatus.COMPLETE, 7, 5, '', 0),
    // FIX: Corrected typo in Department enum to match definition.
    createLog('Favour Achumba', 'AIS/004', Department.ACCOUNTS_FINANCE, TaskCategory.PROCUREMENT, 'Sent email to Rohan on Interns update.', TaskStatus.IN_PROGRESS, 8, 4, 'Disturbance from vendors that want to see Rohan', 0),
    createLog('Regina tempe dike', 'AIS/011', Department.JANITORIAL, TaskCategory.INVENTORY, 'Taking record of every item that has be moved from the store', TaskStatus.IN_PROGRESS, 7.5, 3, 'No issues', 0),
];

const employeePool = [
    { name: 'David Shadreck', id: 'AIS/008', department: Department.DATA_MANAGEMENT },
    { name: 'Favour Achumba', id: 'AIS/004', department: Department.ACCOUNTS_FINANCE },
    { name: 'Samuel Onyeocha', id: 'AIS/015', department: Department.IT },
    { name: 'Ifeanyichukwu Chibha', id: 'AIS/014', department: Department.ADMIN_HR },
    { name: 'Eze Confidence', id: 'AIS/012', department: Department.COORDINATION },
    { name: 'Regina tempe dike', id: 'AIS/011', department: Department.JANITORIAL },
];

const taskPool = [
    { category: TaskCategory.CONTRACT_TENDER, description: 'Reviewed new tender documents.' },
    { category: TaskCategory.INVOICE, description: 'Processed vendor invoices.' },
    { category: TaskCategory.MAINTENANCE, description: 'Performed server maintenance.' },
    { category: TaskCategory.REPORTING, description: 'Generated weekly performance report.' },
    { category: TaskCategory.COORDINATION, description: 'Organized team sync meeting.' },
    { category: TaskCategory.HOUSE_KEEPING, description: 'Restocked office supplies.' },
    { category: TaskCategory.IT, description: 'Resolved IT support tickets.' },
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomLog = (date: Date): ProductivityLog => {
    const employee = getRandomItem(employeePool);
    const task = getRandomItem(taskPool);
    const statusValues = Object.values(TaskStatus);
    const status = getRandomItem(statusValues);
    const hours = Math.round((Math.random() * 4 + 4) * 2) / 2; // 4 to 8 hours, in 0.5 increments
    const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const hasBlocker = Math.random() > 0.7;
    const blockers = hasBlocker ? 'Minor network disruptions.' : '';

    return {
        id: crypto.randomUUID(),
        employeeName: employee.name,
        employeeId: employee.id,
        department: employee.department,
        date: date.toISOString().split('T')[0],
        taskCategory: task.category,
        taskDescription: task.description,
        taskStatus: status,
        hours,
        productivityRating: rating,
        blockers,
    };
};
