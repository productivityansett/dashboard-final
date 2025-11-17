import React from 'react';

interface GlobalFiltersProps {
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
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({ uniqueValues, filters, setFilters }) => {

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, [name]: value }}));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-start flex-wrap gap-3">
             <select
                name="employee"
                value={filters.employee}
                onChange={handleSelectChange}
                aria-label="Filter by employee"
                className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
            >
                <option value="">All Employees</option>
                {uniqueValues.employees.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <select
                name="department"
                value={filters.department}
                onChange={handleSelectChange}
                aria-label="Filter by department"
                className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40"
            >
                <option value="">All Departments</option>
                {uniqueValues.departments.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <input
              type="date"
              name="start"
              aria-label="Start date"
              value={filters.dateRange.start}
              onChange={handleDateChange}
              className={`bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40`}
            />
            <input
              type="date"
              name="end"
              aria-label="End date"
              value={filters.dateRange.end}
              onChange={handleDateChange}
              className={`bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none flex-grow sm:flex-grow-0 sm:w-40`}
            />
            <button 
              onClick={filters.handleReset}
              className="py-1.5 px-4 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold rounded-md transition-colors flex-grow sm:flex-grow-0"
              aria-label="Reset all filters"
            >
              Reset
            </button>
        </div>
    </div>
  );
};