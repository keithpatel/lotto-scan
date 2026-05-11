import React, { useState, useMemo } from 'react';
import { Search, Filter, Ticket, Package, DollarSign, Clock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivatePackModal } from '@/components/ActivatePackModal';
import { EditPackModal } from '@/components/EditPackModal';
import { useStore, Pack } from '@/contexts/StoreContext';

export function Inventory() {
  const { packs: inventoryData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [packToEdit, setPackToEdit] = useState<Pack | null>(null);

  const { totalValue, activePacksCount, totalTicketsRemaining, totalSoldValue, valueBreakdown, openingValue } = useMemo(() => {
    return inventoryData.reduce((acc, pack) => {
      const ticketsSold = pack.currentTicket;
      const ticketsRemaining = Math.max(0, pack.totalTickets - pack.currentTicket);
      const valueLeft = ticketsRemaining * pack.price;
      const soldValue = ticketsSold * pack.price;
      const openingValueLeft = pack.totalTickets * pack.price;

      if (pack.status === 'Active') {
        if (!acc.valueBreakdown[pack.price]) acc.valueBreakdown[pack.price] = { count: 0, value: 0 };
        acc.valueBreakdown[pack.price].count += ticketsRemaining;
        acc.valueBreakdown[pack.price].value += valueLeft;
        acc.openingValue += openingValueLeft;
      }
      
      return {
        totalValue: acc.totalValue + valueLeft,
        totalSoldValue: acc.totalSoldValue + soldValue,
        totalTicketsRemaining: acc.totalTicketsRemaining + ticketsRemaining,
        activePacksCount: acc.activePacksCount + (pack.status === 'Active' ? 1 : 0),
        valueBreakdown: acc.valueBreakdown,
        openingValue: acc.openingValue
      };
    }, { 
      totalValue: 0, 
      totalSoldValue: 0, 
      totalTicketsRemaining: 0, 
      activePacksCount: 0,
      valueBreakdown: {} as Record<number, { count: number, value: number }>,
      openingValue: 0
    });
  }, [inventoryData]);

  const filteredData = inventoryData.filter(pack => 
    pack.game.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pack.id.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-display font-bold tracking-tight" style={{ color: '#f5f5f7' }}>Inventory Dashboard</h1>
          <p className="mt-1" style={{ color: '#71717a' }}>Live overview of your physical scratcher tickets.</p>
        </div>
        <button 
          onClick={() => setIsActivateModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer animate-fade-in-up delay-100"
          style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Package className="w-4 h-4" />
          Activate Pack
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-6 animate-fade-in-up delay-200" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#71717a' }}>Total Shelf Value</div>
            <div className="text-3xl font-display font-black" style={{ color: '#fbbf24' }}>${totalValue.toLocaleString()}</div>
            <div className="text-xs font-medium mt-2" style={{ color: '#71717a' }}>Closing Day Value</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl p-6 animate-fade-in-up delay-300" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#71717a' }}>Revenue Sold</div>
            <div className="text-3xl font-display font-black" style={{ color: '#34d399' }}>${totalSoldValue.toLocaleString()}</div>
            <div className="text-xs font-medium mt-2" style={{ color: '#71717a' }}>From active & completed packs</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 animate-fade-in-up delay-400" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#71717a' }}>Active Packs</div>
            <div className="text-3xl font-display font-black" style={{ color: '#f5f5f7' }}>{activePacksCount}</div>
            <div className="text-xs font-medium mt-2" style={{ color: '#71717a' }}>Currently on display</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 animate-fade-in-up delay-500" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex flex-col sm:flex-row justify-between mb-4 pb-4 gap-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <h3 className="text-lg font-display font-bold" style={{ color: '#f5f5f7' }}>Value Breakdown</h3>
            <p className="text-sm" style={{ color: '#71717a' }}>Breakdown of tickets currently in active packs.</p>
          </div>
          <div className="flex gap-6 sm:justify-end text-sm">
            <div>
              <span className="block text-xs" style={{ color: '#71717a' }}>Opening Day Value</span>
              <span className="font-display font-bold text-lg" style={{ color: '#f5f5f7' }}>${openingValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: '#71717a' }}>Closing Day Value</span>
              <span className="font-display font-bold text-lg" style={{ color: '#fbbf24' }}>${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.keys(valueBreakdown).length > 0 ? (
            Object.entries(valueBreakdown).sort((a,b) => Number(a[0]) - Number(b[0])).map(([price, dataRaw]) => {
              const data = dataRaw as { count: number; value: number; };
              return (
              <div key={price} className="rounded-xl p-3 transition-all hover:scale-[1.02]" style={{ background: '#1e1e28', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="text-xs font-medium mb-1" style={{ color: '#fbbf24' }}>${price} tickets</div>
                <div className="text-lg font-display font-bold" style={{ color: '#f5f5f7' }}>${data.value.toLocaleString()}</div>
                <div className="text-xs mt-1" style={{ color: '#71717a' }}>{data.count} remaining</div>
              </div>
            )})
          ) : (
            <div className="col-span-full py-8 text-center text-sm" style={{ color: '#71717a' }}>
              No active tickets found.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl flex flex-col min-h-0 flex-1 overflow-hidden animate-fade-in-up delay-500" style={{ background: '#1a1a24', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="p-4 flex flex-col sm:flex-row gap-3" style={{ background: '#1e1e28', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#71717a' }} />
            <input 
              type="text" 
              placeholder="Search by game name, barcode ID..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f5f5f7' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer" style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }}>
            <Filter className="h-4 w-4 mr-2" />
            View: All Active
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ background: '#1e1e28', color: '#71717a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th className="py-4 px-6 w-1/3">Game & Identifier</th>
                <th className="py-4 px-6">Progress (Sold / Total)</th>
                <th className="py-4 px-6 text-right">Remaining Value</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ color: 'rgba(255, 255, 255, 0.08)' }}>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#1e1e28', border: '2px solid rgba(255, 255, 255, 0.08)' }}>
                      <Ticket className="w-6 h-6" style={{ color: '#71717a' }} />
                    </div>
                    <p className="font-semibold" style={{ color: '#f5f5f7' }}>No packs found.</p>
                    <p className="text-sm mt-1" style={{ color: '#71717a' }}>Activate a new pack to add it to your inventory.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const ticketsSold = row.currentTicket;
                  const totalTix = row.totalTickets;
                  const ticketsRemaining = Math.max(0, totalTix - ticketsSold);
                  const percentSold = Math.min(100, Math.max(0, (ticketsSold / totalTix) * 100));
                  const valueLeft = ticketsRemaining * row.price;
                  
                  return (
                    <tr key={row.id} className="transition-colors cursor-pointer group" style={{ background: '#1a1a24' }}>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold tracking-tight" style={{ color: '#f5f5f7' }}>{row.game}</span>
                          <span className="text-xs font-mono mt-0.5" style={{ color: '#71717a' }}>ID: {row.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col justify-center max-w-[200px]">
                           <div className="flex justify-between text-xs font-semibold mb-1.5">
                             <span style={{ color: '#a1a1aa' }}>{ticketsSold} tickets sold</span>
                             <span style={{ color: '#71717a' }}>{totalTix} total</span>
                           </div>
                           <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
                             <div 
                               className="h-full transition-all duration-500" 
                               style={{ 
                                 width: `${percentSold}%`,
                                 background: percentSold > 90 ? '#10b981' : '#fbbf24'
                               }}
                             />
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold" style={{ color: '#f5f5f7' }}>${valueLeft.toLocaleString()}</span>
                          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: '#71717a' }}>{ticketsRemaining} left @ ${row.price}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                        )} style={{
                          background: row.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : row.status === 'Sold Out' ? '#1e1e28' : 'rgba(245, 158, 11, 0.15)',
                          color: row.status === 'Active' ? '#34d399' : row.status === 'Sold Out' ? '#71717a' : '#f59e0b',
                          border: `1px solid ${row.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : row.status === 'Sold Out' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {row.status === 'Active' ? 'Active' : row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPackToEdit(row);
                          }}
                          className="p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                          style={{ color: '#71717a' }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 flex items-center justify-between text-sm mt-auto" style={{ background: '#1e1e28', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: '#71717a' }}>
          <div>Showing <strong style={{ color: '#f5f5f7' }}>{filteredData.length}</strong> {filteredData.length === 1 ? 'pack' : 'packs'}</div>
        </div>
      </div>
      
      <ActivatePackModal 
        isOpen={isActivateModalOpen} 
        onClose={() => setIsActivateModalOpen(false)} 
      />
      
      {packToEdit && (
        <EditPackModal
          isOpen={!!packToEdit}
          onClose={() => setPackToEdit(null)}
          pack={packToEdit}
        />
      )}
    </div>
  );
}