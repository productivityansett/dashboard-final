import React, { useState } from 'react';
import { useProductivityData } from './hooks/useProductivityData';
import DashboardPage from './pages/DashboardPage';
import LogEntryPage from './pages/LogEntryPage';
import type { DailyLogSubmission } from './types';

// Check for URL parameter to determine the view mode (role)
const params = new URLSearchParams(window.location.search);
const isAdminView = params.get('view') === 'dashboard';

// A sandboxed version of the app for employees
const EmployeeView: React.FC = () => {
    // We only need the addLog function for this view
    const { addLog } = useProductivityData({ dateRange: { start: '', end: '' }, department: '', employee: '' });
    
    const handleEmployeeSubmit = (submission: DailyLogSubmission) => {
        addLog(submission);
        // The LogEntryPage will handle showing a success message and allowing another submission.
        // We do not navigate away from this page for the employee.
    };
    
    // Employee view only renders the log entry page, with no "back" functionality.
    return <LogEntryPage onSubmit={handleEmployeeSubmit} />;
};


// The full-featured version of the app for admins/executives
const AdminView: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'logEntry'>('dashboard');
  
    const [filters, setFilters] = useState({
      dateRange: { start: '', end: '' },
      department: '',
      employee: ''
    });

    const { logs, addLog, kpiData, uniqueValues } = useProductivityData(filters);

    const handleAdminSubmit = (submission: DailyLogSubmission) => {
      addLog(submission);
      setView('dashboard'); // Switch admin back to dashboard after submission
    };

    if (view === 'logEntry') {
      return <LogEntryPage onSubmit={handleAdminSubmit} onBack={() => setView('dashboard')} />;
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


const App: React.FC = () => {
  // Render the correct view based on the URL parameter
  if (isAdminView) {
    return <AdminView />;
  }
  return <EmployeeView />;
};

export default App;