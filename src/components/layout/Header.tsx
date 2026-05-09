import React, { useState } from 'react';
import { Bell, Search, Menu, PackagePlus, ClipboardCheck, Clock, CheckCircle, X, CalendarCheck } from 'lucide-react';
import { AuditModal } from '@/components/AuditModal';
import { ActivatePackModal } from '@/components/ActivatePackModal';
import { CloseDayModal } from '@/components/CloseDayModal';
import { useStore, Shift } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [isActivateModalOpen, setActivateModalOpen] = useState(false);
  const [isStartShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [isCloseDayModalOpen, setCloseDayModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  const { activeShift, employees, startShift, audits, dayCloses } = useStore();
  const { logOut } = useAuth();

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    await startShift({
      id: `SHF-${Math.floor(Math.random() * 90000) + 10000}`,
      employeeId: emp.id,
      employeeName: emp.name,
      startTime: new Date().toISOString(),
      status: 'Active'
    });
    setStartShiftModalOpen(false);
  };

  const todayStr = new Date().toLocaleString([], { dateStyle: 'short' });
  const pastAudits = audits.filter(a => a.date.split(',')[0].trim() !== todayStr);
  const unclosedPastDays = new Set<string>();
  pastAudits.forEach(a => {
    const dateStr = a.date.split(',')[0].trim();
    if (!dayCloses.some(dc => dc.date === dateStr)) {
      unclosedPastDays.add(dateStr);
    }
  });
  const hasUnclosedPastDays = unclosedPastDays.size > 0;

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 md:px-8">
        <div className="flex items-center gap-1.5 md:gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          {activeShift ? (
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-700 bg-blue-50 px-2 py-1 md:px-3 md:py-1 rounded-full font-medium flex-shrink-0">
              <Clock className="w-3.5 h-3.5 hidden md:block" />
              <span className="truncate max-w-[80px] md:max-w-[200px]">Shift: {activeShift.employeeName}</span>
            </div>
          ) : (
            <span className="text-xs md:text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 md:px-3 md:py-1 rounded-full flex-shrink-0">No active shift</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
          <button 
            onClick={() => setCloseDayModalOpen(true)}
            className="flex h-8 md:h-9 items-center gap-1.5 md:gap-2 rounded-lg bg-indigo-50 text-indigo-700 px-2 md:px-4 text-xs md:text-sm font-semibold hover:bg-indigo-100 transition-colors flex-shrink-0"
            title="Close Day"
          >
            <CalendarCheck className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">Close Day</span>
          </button>

          {!activeShift ? (
            <button 
              onClick={() => setStartShiftModalOpen(true)}
              className="flex h-8 md:h-9 items-center gap-1.5 md:gap-2 rounded-lg bg-emerald-600 px-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors flex-shrink-0"
              title="Start Shift"
            >
              <CheckCircle className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden md:inline">Start Shift</span>
            </button>
          ) : (
            <button 
              onClick={() => setAuditModalOpen(true)}
              className="flex h-8 md:h-9 items-center gap-1.5 md:gap-2 rounded-lg bg-blue-600 px-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors flex-shrink-0"
              title="End Shift Audit"
            >
              <ClipboardCheck className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden md:inline">End Shift</span>
            </button>
          )}

          <button 
            onClick={logOut}
            className="hidden sm:flex h-8 w-8 rounded-full bg-slate-200 items-center justify-center overflow-hidden flex-shrink-0 hover:bg-slate-300 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <span className="text-xs font-semibold text-slate-500">Out</span>
          </button>
        </div>
      </header>

      {isStartShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Start Shift</h2>
                <p className="text-sm text-slate-500">Select the employee starting their shift.</p>
              </div>
              <button onClick={() => setStartShiftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStartShift} className="p-6 space-y-4">
              {hasUnclosedPastDays && (
                <div className="text-sm border border-red-200 bg-red-50 rounded-lg p-3 text-red-700">
                  <p className="font-semibold mb-1">Unclosed Days Detected</p>
                  <p>You have unclosed shifts from previous days. Please close those days before starting a new shift.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                {employees.length === 0 ? (
                  <div className="text-sm border border-amber-200 bg-amber-50 rounded-lg p-3 text-amber-700">
                    No employees found. Please add an employee in the Team tab first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={hasUnclosedPastDays}
                  >
                    <option value="" disabled>Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStartShiftModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId || hasUnclosedPastDays}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                >
                  Start Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <AuditModal isOpen={isAuditModalOpen} onClose={() => setAuditModalOpen(false)} />
      <ActivatePackModal isOpen={isActivateModalOpen} onClose={() => setActivateModalOpen(false)} />
      <CloseDayModal isOpen={isCloseDayModalOpen} onClose={() => setCloseDayModalOpen(false)} />
    </>
  );
}
