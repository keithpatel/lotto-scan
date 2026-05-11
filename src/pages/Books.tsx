import React, { useState } from 'react';
import { BookOpen, Plus, X, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useStore, ScratcherBook, Pack } from '../contexts/StoreContext';
import { cn } from '@/lib/utils';
import { EditPackModal } from '@/components/EditPackModal';

export function Books() {
  const { books, packs, addBook, updateBook, deleteBook, deletePack } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<ScratcherBook | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [deletingPackId, setDeletingPackId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'packs' | 'templates'>('packs');

  const [formData, setFormData] = useState({
    name: '',
    price: '10',
    totalTickets: '60',
    gameNumber: ''
  });

  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.gameNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBook) {
      await updateBook(editingBook.id, {
        name: formData.name,
        price: Number(formData.price),
        totalTickets: Number(formData.totalTickets),
        gameNumber: formData.gameNumber
      });
    } else {
      await addBook({
        id: `BK-${Math.floor(Math.random() * 900000) + 100000}`,
        name: formData.name,
        price: Number(formData.price),
        totalTickets: Number(formData.totalTickets),
        gameNumber: formData.gameNumber,
        isActive: true
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: '10', totalTickets: '60', gameNumber: '' });
    setShowAddModal(false);
    setEditingBook(null);
  };

  const openEditModal = (book: ScratcherBook) => {
    setFormData({
      name: book.name,
      price: book.price.toString(),
      totalTickets: book.totalTickets.toString(),
      gameNumber: book.gameNumber || ''
    });
    setEditingBook(book);
    setShowAddModal(true);
  };

  const handleDelete = async (bookId: string) => {
    if (confirm('Are you sure you want to delete this book template?')) {
      await deleteBook(bookId);
    }
  };

  const handleDeletePack = async () => {
    if (deletingPackId && confirm('Are you sure you want to delete this pack? This action cannot be undone.')) {
      await deletePack(deletingPackId);
      setDeletingPackId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight" style={{ color: '#f5f5f7' }}>Scratcher Books</h1>
          <p className="mt-1" style={{ color: '#71717a' }}>Manage active packs and book templates.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('packs')}
            className={cn("px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer", viewMode === 'packs' ? "text-black" : "")}
            style={viewMode === 'packs' ? { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)' } : { background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }}
          >
            <Package className="w-4 h-4 inline mr-1" />
            Active Packs
          </button>
          <button 
            onClick={() => setViewMode('templates')}
            className={cn("px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer", viewMode === 'templates' ? "text-black" : "")}
            style={viewMode === 'templates' ? { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)' } : { background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }}
          >
            <BookOpen className="w-4 h-4 inline mr-1" />
            Templates
          </button>
        </div>
      </div>

      {viewMode === 'packs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.filter(p => p.status === 'Active').map((pack) => {
            const ticketsRemaining = Math.max(0, pack.totalTickets - pack.currentTicket);
            const valueLeft = ticketsRemaining * pack.price;
            return (
              <div key={pack.id} className="p-5 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold" style={{ color: '#f5f5f7' }}>{pack.game}</h3>
                    <p className="text-xs font-mono" style={{ color: '#71717a' }}>{pack.id}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Sold</p>
                    <p className="font-semibold">{pack.currentTicket} / {pack.totalTickets}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Price</p>
                    <p className="font-semibold text-emerald-600">${pack.price}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs">Remaining Value</p>
                    <p className="font-bold text-lg text-slate-900">${valueLeft.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingPack(pack)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Pack"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingPackId(pack.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Pack"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
);
          })}
          {packs.filter(p => p.status === 'Active').length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
              No active packs. Activate a pack from Inventory.
            </div>
          )}
        </div>
      )}

      {viewMode === 'templates' && (
        <>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or game number..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4 px-6">Game Name</th>
                <th className="py-4 px-6">Game #</th>
                <th className="py-4 px-6 text-center">Price</th>
                <th className="py-4 px-6 text-center">Total Tickets</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center bg-white">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-slate-100">
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-semibold">No books found.</p>
                    <p className="text-slate-500 text-sm mt-1">Add a book template to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{book.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-slate-500">{book.gameNumber || '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-emerald-600">${book.price}</span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      {book.totalTickets}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                        book.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      )}>
                        {book.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <div>Showing <strong>{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'book' : 'books'}</div>
</div>
          </div>
        </>
      )}

      {editingPack && (
        <EditPackModal
          isOpen={!!editingPack}
          onClose={() => setEditingPack(null)}
          pack={editingPack}
        />
      )}

      {deletingPackId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Pack?</h3>
              <p className="text-sm text-slate-500 mt-2">This will permanently remove this pack from your inventory.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingPackId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePack}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}