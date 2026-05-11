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
      <header className="flex h-16 items-center justify-between px-4 md:px-8" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg flex-shrink-0 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          {activeShift ? (
            <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 rounded-full font-medium flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald-light)' }}>
              <Clock className="w-3.5 h-3.5 hidden md:block" />
              <span className="truncate max-w-[80px] md:max-w-[200px]">Shift: {activeShift.employeeName}</span>
            </div>
          ) : (
            <span className="text-xs md:text-sm font-medium px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>No active shift</span>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button 
            onClick={() => setCloseDayModalOpen(true)}
            className="flex h-9 items-center gap-2 rounded-xl px-3 md:px-4 text-xs md:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            title="Close Day"
          >
            <CalendarCheck className="w-4 h-4" />
            <span className="hidden md:inline">Close Day</span>
          </button>

          {!activeShift ? (
            <button 
              onClick={() => setStartShiftModalOpen(true)}
              className="flex h-9 items-center gap-2 rounded-xl px-3 md:px-4 text-xs md:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)', color: '#fff' }}
              title="Start Shift"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden md:inline">Start Shift</span>
            </button>
          ) : (
            <button 
              onClick={() => setAuditModalOpen(true)}
              className="flex h-9 items-center gap-2 rounded-xl px-3 md:px-4 text-xs md:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%)', color: '#000', boxShadow: 'var(--shadow-gold)' }}
              title="End Shift Audit"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden md:inline">End Shift</span>
            </button>
          )}

          <button 
            onClick={logOut}
            className="hidden sm:flex h-9 w-9 rounded-xl items-center justify-center overflow-hidden flex-shrink-0 transition-all cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            title="Sign Out"
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Out</span>
          </button>
        </div>
      </header>

      {isStartShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="p-6 flex justify-between items-center" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>Start Shift</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select the employee starting their shift.</p>
              </div>
              <button onClick={() => setStartShiftModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStartShift} className="p-6 space-y-4">
              {hasUnclosedPastDays && (
                <div className="text-sm rounded-lg p-3" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)' }}>
                  <p className="font-semibold mb-1">Unclosed Days Detected</p>
                  <p>You have unclosed shifts from previous days. Please close those days before starting a new shift.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Employee</label>
                {employees.length === 0 ? (
                  <div className="text-sm rounded-lg p-3" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--accent-amber)' }}>
                    No employees found. Please add an employee in the Team tab first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    disabled={hasUnclosedPastDays}
                  >
                    <option value="" disabled style={{ color: 'var(--text-muted)' }}>Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} style={{ background: 'var(--bg-secondary)' }}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStartShiftModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId || hasUnclosedPastDays}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)', color: '#fff' }}
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
