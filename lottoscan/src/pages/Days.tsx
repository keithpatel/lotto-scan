import React, { useState } from 'react';
import { CalendarCheck, RotateCcw, AlertCircle, X, Check } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export function Days() {
  const { dayCloses, deleteDayClose } = useStore();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleReopen = async (id: string) => {
    await deleteDayClose(id);
    setConfirmingId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Day Closes</h1>
          <p className="mt-2 text-slate-500">Historical record of daily closing reconciliations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Shifts</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Day Sales</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Net Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Cash</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dayCloses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                    <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900">No day closes yet</p>
                    <p className="text-sm mt-1">When you close a day, it will appear here.</p>
                  </td>
                </tr>
              ) : (
                dayCloses.map((day) => (
                  <tr key={day.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{day.date}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{day.id}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-sm">
                        {day.shiftsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-slate-900">${day.totalShiftSales.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-slate-600">${day.totalNetDue.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-emerald-600">${day.overallDayCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {confirmingId === day.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-semibold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Sure?</span>
                          <button
                            onClick={() => handleReopen(day.id)}
                            className="p-1 text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                            title="Confirm Reopen"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="p-1 text-slate-500 hover:bg-slate-200 bg-slate-100 rounded transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(day.id)}
                          className="text-sm px-3 py-1.5 flex items-center gap-1.5 ml-auto font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reopen Day"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
