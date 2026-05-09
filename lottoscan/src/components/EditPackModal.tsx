import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { useStore, Pack } from '../contexts/StoreContext';

interface EditPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: Pack;
}

export function EditPackModal({ isOpen, onClose, pack }: EditPackModalProps) {
  const { updatePack, deletePack } = useStore();
  const [currentTicket, setCurrentTicket] = useState(pack.currentTicket);
  const [totalTickets, setTotalTickets] = useState(pack.totalTickets);
  const [status, setStatus] = useState(pack.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentTicket(pack.currentTicket);
      setTotalTickets(pack.totalTickets);
      setStatus(pack.status);
      setIsSubmitting(false);
      setShowConfirmDelete(false);
    }
  }, [isOpen, pack]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePack(pack.id, {
        currentTicket: Number(currentTicket),
        totalTickets: Number(totalTickets),
        status,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deletePack(pack.id);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Edit Pack</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Make corrections to an existing pack</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Game</label>
             <input
               type="text"
               disabled
               value={pack.game}
               className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
             />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Pack ID / Barcode</label>
             <input
               type="text"
               disabled
               value={pack.id}
               className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm cursor-not-allowed"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Ticket</label>
              <input
                type="text"
                inputMode="text"
                required
                value={currentTicket}
                onChange={(e) => setCurrentTicket(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Tickets</label>
              <select
                required
                value={totalTickets}
                onChange={(e) => setTotalTickets(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                {Array.from({ length: 250 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
             <select
               value={status}
               onChange={(e) => setStatus(e.target.value as any)}
               className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
             >
               <option value="Active">Active</option>
               <option value="Backstock">Backstock</option>
               <option value="Sold Out">Sold Out</option>
               <option value="Missing">Missing</option>
             </select>
          </div>

          {showConfirmDelete ? (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <p className="text-sm text-red-600 font-medium text-center bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                Are you sure you want to delete this pack?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                title="Delete Pack"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
