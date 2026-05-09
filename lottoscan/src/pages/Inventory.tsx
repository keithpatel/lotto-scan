import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, CheckCircle2, Ticket, Package, DollarSign, BatteryFull, BatteryMedium, BatteryLow, AlertCircle, Clock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivatePackModal } from '@/components/ActivatePackModal';
import { EditPackModal } from '@/components/EditPackModal';
import { useStore, Pack } from '@/contexts/StoreContext';

export function Inventory() {
  const { packs: inventoryData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [packToEdit, setPackToEdit] = useState<Pack | null>(null);

  // Compute metrics
  const { totalValue, activePacksCount, totalTicketsRemaining, totalSoldValue, valueBreakdown, openingValue } = useMemo(() => {
    return inventoryData.reduce((acc, pack) => {
      const ticketsSold = pack.currentTicket; // Barcode value is number of tickets sold
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 flex flex-col h-full overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Dashboard</h1>
          <p className="text-slate-500 mt-1">Live overview of your physical scratcher tickets.</p>
        </div>
        <button 
          onClick={() => setIsActivateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Activate Pack
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <DollarSign className="w-24 h-24 text-blue-600" />
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Shelf Value</div>
          <div className="text-3xl font-black text-slate-900">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Closing Day Value</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <DollarSign className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Revenue Sold</div>
          <div className="text-3xl font-black text-slate-900">${totalSoldValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">From active & completed packs</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Active Packs</div>
          <div className="text-3xl font-black text-blue-600">{activePacksCount}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Currently on display</div>
        </div>
      </div>

      {/* Value Breakdown Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between mb-4 pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Value Breakdown</h3>
            <p className="text-sm text-slate-500">Breakdown of tickets currently in active packs.</p>
          </div>
          <div className="flex gap-6 sm:justify-end text-sm">
            <div>
              <span className="text-slate-500 block">Opening Day Value</span>
              <span className="font-bold text-slate-900 text-lg">${openingValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Closing Day Value</span>
              <span className="font-bold text-slate-900 text-lg">${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.keys(valueBreakdown).length > 0 ? (
            Object.entries(valueBreakdown).sort((a,b) => Number(a[0]) - Number(b[0])).map(([price, dataRaw]) => {
              const data = dataRaw as { count: number; value: number; };
              return (
              <div key={price} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium mb-1">${price} tickets</div>
                <div className="text-lg font-bold text-slate-900">${data.value.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">{data.count} remaining</div>
              </div>
            )})
          ) : (
            <div className="col-span-full py-4 text-center text-slate-500 text-sm">
              No active tickets found.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by game name, barcode ID..." 
              className="w-full pl-10 pr-4 py-2.5 flex items-center gap-3 rounded-xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            View: All Active
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4 px-6 w-1/3">Game & Identifier</th>
                <th className="py-4 px-6">Progress (Sold / Total)</th>
                <th className="py-4 px-6 text-right">Remaining Value</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center bg-white">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-slate-100">
                      <Ticket className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-semibold">No packs found.</p>
                    <p className="text-slate-500 text-sm mt-1">Activate a new pack to add it to your inventory.</p>
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
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 tracking-tight">{row.game}</span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5">ID: {row.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col justify-center max-w-[200px]">
                           <div className="flex justify-between text-xs font-semibold mb-1.5">
                             <span className="text-slate-600">{ticketsSold} tickets sold</span>
                             <span className="text-slate-400">{totalTix} total</span>
                           </div>
                           <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                             <div 
                               className={cn("h-full transition-all duration-500", percentSold > 90 ? "bg-emerald-500" : percentSold > 50 ? "bg-blue-500" : "bg-blue-400")} 
                               style={{ width: `${percentSold}%` }}
                             />
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">${valueLeft.toLocaleString()}</span>
                          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">{ticketsRemaining} left @ ${row.price}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                          row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          row.status === 'Sold Out' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {row.status === 'Active' ? 'Active' : row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPackToEdit(row);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 mt-auto bg-slate-50/50">
          <div>Showing <strong>{filteredData.length}</strong> {filteredData.length === 1 ? 'pack' : 'packs'}</div>
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
