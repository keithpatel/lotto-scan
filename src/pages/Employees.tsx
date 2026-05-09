import React, { useState } from 'react';
import { Mail, Phone, ShieldAlert, Award, Search, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, Employee } from '../contexts/StoreContext';

export function Employees() {
  const { employees, addEmployee, shifts, activeShift } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Cashier');

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    await addEmployee({
      id: Math.random().toString(36).substring(2, 9),
      name: newEmployeeName.trim(),
      role: newEmployeeRole
    });

    setNewEmployeeName('');
    setNewEmployeeRole('Cashier');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Team Accountability</h1>
          <p className="text-slate-500 mt-1">Monitor employee performance and analyze risk patterns.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
        >
          <UserPlus size={16} />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
            No employees configured yet.
          </div>
        ) : (
          employees.map((emp) => {
            const empShifts = shifts.filter(s => s.employeeId === emp.id);
            const isCurrentlyActive = activeShift?.employeeId === emp.id;

            return (
              <div key={emp.id} className={cn("bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative", isCurrentlyActive ? "border-emerald-200" : "border-slate-200")}>
                
                {isCurrentlyActive && (
                  <div className="absolute top-0 right-0 translate-x-2 -translate-y-2">
                    <span className="flex h-4 w-4 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 border", isCurrentlyActive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600")}>
                    {emp.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 tracking-tight">{emp.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Status</span>
                    <span className={cn("font-semibold", isCurrentlyActive ? "text-emerald-600" : "text-slate-900")}>
                      {isCurrentlyActive ? 'On Shift' : 'Off Shift'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Shifts</span>
                    <span className="font-semibold text-slate-900">{empShifts.length}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="text-slate-500 flex items-center gap-1">ID: {emp.id.toUpperCase()}</span>
                  </div>
                  <button className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Employee</h2>
                <p className="text-sm text-slate-500">Register a new team member to track shifts.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newEmployeeRole}
                  onChange={(e) => setNewEmployeeRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Shift Lead">Shift Lead</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
