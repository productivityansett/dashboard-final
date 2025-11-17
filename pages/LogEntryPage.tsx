import React, { useState } from 'react';
import { Department, TaskCategory, TaskStatus } from '../types';
import type { DailyLogSubmission, TaskItem } from '../types';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="50" cy="50" r="48" stroke="#f39200" strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="46" fill="#3b3b98" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="#ed1c24" strokeWidth="6" />
        <text x="27" y="68" fontFamily="Arial, Helvetica, sans-serif" fontSize="50" fontWeight="bold" fill="white" textAnchor="middle">A</text>
        <text x="73" y="68" fontFamily="Arial, Helvetica, sans-serif" fontSize="50" fontWeight="bold" fill="white" textAnchor="middle">S</text>
    </svg>
);

const LogEntryHeader: React.FC<{onBack?: () => void}> = ({ onBack }) => (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8"/>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              AIS Daily Log
            </h1>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              &larr; Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </header>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.718c-1.126 0-2.037.955-2.037 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


interface LogEntryPageProps {
  onSubmit: (data: DailyLogSubmission) => void;
  onBack?: () => void; // onBack is now optional
}

const LogEntryPage: React.FC<LogEntryPageProps> = ({ onSubmit, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const initialFormData = {
    date: today,
    employeeName: '',
    employeeId: '',
    department: Department.DATA_MANAGEMENT,
    hours: 8,
    productivityRating: 0,
    blockers: '',
    tasksCarriedOver: '',
  };
  
  const initialTasks = [
    { id: crypto.randomUUID(), taskDescription: '', taskCategory: TaskCategory.ADMIN, taskStatus: TaskStatus.IN_PROGRESS }
  ];

  const [formData, setFormData] = useState<Omit<DailyLogSubmission, 'tasks'>>(initialFormData);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setFormData(initialFormData);
    setTasks(initialTasks);
    setError('');
    setSubmitted(false);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'hours' ? parseFloat(value) || 0 : value }));
  };
  
  const handleTaskChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTasks(currentTasks => currentTasks.map(task => 
      task.id === id ? { ...task, [name]: value } : task
    ));
  };
  
  const handleAddTask = () => {
    if(tasks.length < 10) {
        setTasks(currentTasks => [...currentTasks, { id: crypto.randomUUID(), taskDescription: '', taskCategory: TaskCategory.ADMIN, taskStatus: TaskStatus.IN_PROGRESS }]);
    }
  };
  
  const handleRemoveTask = (id: string) => {
    if (tasks.length > 1) {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.employeeId || formData.hours <= 0 || formData.productivityRating === 0) {
        setError('Please fill all required employee details, hours, and provide a rating.');
        setSubmitted(false);
        return;
    }
    if (tasks.some(task => !task.taskDescription)) {
        setError('Please ensure every task has a description.');
        setSubmitted(false);
        return;
    }

    setError('');
    onSubmit({ ...formData, tasks });
    setSubmitted(true);
  };

  if (submitted) {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
            <LogEntryHeader onBack={onBack}/>
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-lg border border-slate-700 p-8 text-center">
                    <h2 className="text-2xl font-bold text-green-400 mb-4">Log Submitted Successfully!</h2>
                    <p className="text-slate-400 mb-6">Your daily productivity log has been recorded.</p>
                    {onBack ? (
                       <button onClick={onBack} className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                           Return to Dashboard
                       </button>
                    ) : (
                       <button onClick={resetForm} className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                           Submit Another Log
                       </button>
                    )}
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <LogEntryHeader onBack={onBack} />
      <main className="p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-4xl border border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* --- Employee Details Section --- */}
              <div className="border-b border-slate-700 pb-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Employee & Work Details</h2>
                <p className="text-sm text-slate-400 mb-4">Enter your general information for today's log.</p>
                {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="employeeName" className="block text-sm font-medium text-slate-300 mb-1">Employee Name *</label>
                      <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleGeneralChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="employeeId" className="block text-sm font-medium text-slate-300 mb-1">Employee ID *</label>
                      <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleGeneralChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                   <div>
                      <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Date of Work</label>
                      <input 
                        type="date" 
                        name="date" 
                        id="date" 
                        value={formData.date}
                        onChange={handleGeneralChange}
                        min={today}
                        max={today}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none sm:max-w-sm"
                      />
                    </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                    <select name="department" id="department" value={formData.department} onChange={handleGeneralChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      {Object.values(Department).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium text-slate-300 mb-1">Total Hours Worked Today *</label>
                        <input type="number" name="hours" id="hours" value={formData.hours} onChange={handleGeneralChange} step="0.5" min="0" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Overall Productivity Rating *</label>
                        <div className="flex items-center justify-between space-x-1 bg-slate-700 border border-slate-600 rounded-lg p-1">
                            {[1, 2, 3, 4, 5].map(r => (
                            <button key={r} type="button" onClick={() => setFormData(prev => ({ ...prev, productivityRating: r }))}
                                className={`w-full h-9 rounded-md transition-all text-sm font-semibold ${formData.productivityRating === r ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-300 hover:bg-slate-600'}`}
                            >
                                {r}
                            </button>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* --- Tasks Section --- */}
              <div className="border-b-0 pb-0">
                 <h2 className="text-xl font-bold text-white mb-1">Daily Tasks</h2>
                 <p className="text-sm text-slate-400 mb-4">Add each task you worked on today. Total hours will be distributed evenly.</p>
                 <div className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex flex-col space-y-4">
                            <div className='flex justify-between items-start'>
                                <div className='flex-grow pr-4'>
                                    <label htmlFor={`taskDescription-${task.id}`} className="block text-sm font-medium text-slate-300 mb-1">Task Description *</label>
                                    <textarea name="taskDescription" id={`taskDescription-${task.id}`} value={task.taskDescription} onChange={(e) => handleTaskChange(task.id, e)} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                </div>
                                <button type="button" onClick={() => handleRemoveTask(task.id)} className="mt-7 p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={tasks.length <= 1}>
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`taskCategory-${task.id}`} className="block text-sm font-medium text-slate-300 mb-1">Task Category</label>
                                    <select name="taskCategory" id={`taskCategory-${task.id}`} value={task.taskCategory} onChange={(e) => handleTaskChange(task.id, e)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        {Object.values(TaskCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor={`taskStatus-${task.id}`} className="block text-sm font-medium text-slate-300 mb-1">Task Status</label>
                                    <select name="taskStatus" id={`taskStatus-${task.id}`} value={task.taskStatus} onChange={(e) => handleTaskChange(task.id, e)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        {Object.values(TaskStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
                 <button type="button" onClick={handleAddTask} className="mt-4 flex items-center space-x-2 py-2 px-4 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-colors" disabled={tasks.length >= 10}>
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Another Task</span>
                 </button>
              </div>

             {/* --- End of Day Summary --- */}
              <div className="border-t border-slate-700 pt-6 mt-6">
                 <h2 className="text-xl font-bold text-white mb-1">End of Day Summary</h2>
                 <p className="text-sm text-slate-400 mb-4">Provide a summary of any pending items for the next day.</p>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="tasksCarriedOver" className="block text-sm font-medium text-slate-300 mb-1">Tasks carried over to next day</label>
                        <textarea name="tasksCarriedOver" id="tasksCarriedOver" value={formData.tasksCarriedOver} onChange={handleGeneralChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>
                      <div>
                        <label htmlFor="blockers" className="block text-sm font-medium text-slate-300 mb-1">Blockers / Issues Faced</label>
                        <textarea name="blockers" id="blockers" value={formData.blockers} onChange={handleGeneralChange} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>
                 </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-900/50 border-t border-slate-700 rounded-b-xl">
              <button type="submit" className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">
                Submit Daily Log
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LogEntryPage;