import React, { useState } from 'react';
import { X, CalendarCheck, Coins, Hash, RotateCcw } from 'lucide-react';
import { useStore, DayClose } from '../contexts/StoreContext';
import { cn } from '@/lib/utils';

interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CloseDayModal({ isOpen, onClose }: CloseDayModalProps) {
  const { audits, addDayClose, dayCloses, deleteDayClose } = useStore();
  const [netDueInput, setNetDueInput] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [confirmingReopen, setConfirmingReopen] = useState(false);
  
  // Find all unclosed dates
  const unclosedDates = React.useMemo(() => {
    const dates = new Set<string>();
    audits.forEach(a => {
      const dateStr = a.date.split(',')[0].trim();
      if (!dayCloses.some(dc => dc.date === dateStr)) {
        dates.add(dateStr);
      }
    });
    const arr = Array.from(dates);
    // Sort oldest first roughly
    arr.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return arr;
  }, [audits, dayCloses]);

  // Get closed dates
  const closedDates = React.useMemo(() => {
    return dayCloses.map(dc => dc.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [dayCloses]);

  const isSelectedDateClosed = closedDates.includes(selectedDateStr);

  React.useEffect(() => {
    if (isOpen) {
      if (unclosedDates.length > 0) {
        setSelectedDateStr(unclosedDates[0]);
      } else if (closedDates.length > 0) {
        setSelectedDateStr(closedDates[0]);
      } else {
        setSelectedDateStr(new Date().toLocaleString([], { dateStyle: 'short' }));
      }
      setNetDueInput('');
      setConfirmingReopen(false);
    }
  }, [isOpen, unclosedDates, closedDates]);

  if (!isOpen) return null;

  const targetDateStr = selectedDateStr;
  
  const targetAudits = audits.filter(a => {
    const auditDateStr = a.date.split(',')[0].trim();
    return auditDateStr === targetDateStr;
  });

  const totalShiftSales = targetAudits.reduce((sum, audit) => sum + audit.salesCalculated, 0);
  const totalAuditNetDue = targetAudits.reduce((sum, audit) => sum + (audit.netDue || 0), 0);
  
  const additionalNetDue = parseFloat(netDueInput) || 0;
  
  // Total Day Cash is the sum of cash collected across shifts + any final net due adjustments
  const totalDayCash = totalShiftSales + additionalNetDue;

  const handleCloseDay = async () => {
    await addDayClose({
      id: `DC-${Math.floor(Math.random() * 900000) + 100000}`,
      date: targetDateStr,
      totalShiftSales,
      totalNetDue: additionalNetDue,
      overallDayCash: totalDayCash,
      shiftsCount: targetAudits.length
    });
    onClose();
  };

  const handleReopen = async () => {
    await deleteDayClose(selectedDateStr);
    setConfirmingReopen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Close Day</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500 font-medium">Select Date:</span>
                <select
                  value={selectedDateStr}
                  onChange={(e) => {
                    setSelectedDateStr(e.target.value);
                    setConfirmingReopen(false);
                  }}
                  className="bg-white border border-slate-300 rounded text-sm px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {unclosedDates.length > 0 && (
                    <optgroup label="Open Dates">
                      {unclosedDates.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </optgroup>
                  )}
                  {closedDates.length > 0 && (
                    <optgroup label="Previously Closed">
                      {closedDates.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {targetAudits.length === 0 ? (
            <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
              <p className="font-semibold text-lg">No Shifts Completed</p>
              <p className="text-sm mt-1">There are no completed shift audits for {selectedDateStr}.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={16} className="text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Shifts</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{targetAudits.length}</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins size={16} className="text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Day Ticket Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">${totalShiftSales.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">Shift Drilldown</h3>
                {targetAudits.map((audit) => (
                  <div key={audit.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{audit.employee}</p>
                      <p className="text-slate-500 text-xs">{audit.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">${(audit.salesCalculated).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                  <span>Additional Net Due / Adjustments</span>
                  <span className="text-slate-400 font-normal text-xs">(e.g. End of day drops)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    value={netDueInput}
                    onChange={(e) => setNetDueInput(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder:font-normal text-lg cursor-text"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            {isSelectedDateClosed ? (
              <>
                <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  This day was previously closed
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Day Cash</p>
            )}
            <p className="text-3xl font-black text-indigo-700">${totalDayCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex justify-end gap-3">
            {isSelectedDateClosed ? (
              confirmingReopen ? (
                <>
                  <span className="flex items-center text-sm font-semibold text-red-600">Reopen this day?</span>
                  <button
                    onClick={() => setConfirmingReopen(false)}
                    className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReopen}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                  >
                    Confirm Reopen
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setConfirmingReopen(true)}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reopen Day
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseDay}
                  disabled={targetAudits.length === 0}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
                >
                  Confirm Day Close
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
