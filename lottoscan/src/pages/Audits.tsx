import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Filter, AlertTriangle, CheckCircle2, ChevronRight, X, Edit3, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, AuditRecord } from '@/contexts/StoreContext';
import { CameraScanner } from '@/components/CameraScanner';

export function Audits() {
  const { audits, packs, updateAudit, updatePackTicket } = useStore();
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Record<string, number>>({});
  const [editedNetDue, setEditedNetDue] = useState('0');
  
  const [scannerInput, setScannerInput] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedAudit) {
      setEditedNetDue(selectedAudit.netDue?.toString() || '0');
      const detailsMap: Record<string, number> = {};
      selectedAudit.details?.forEach(d => {
        detailsMap[d.packId] = d.endTicket;
      });
      setEditedDetails(detailsMap);
      setScannerInput('');
      setUseCamera(false);
    } else {
      setIsEditing(false);
    }
  }, [selectedAudit]);

  const handleCameraScan = (decodedText: string) => {
    setScannerInput(decodedText);
    setUseCamera(false);
    processBarcode(decodedText);
  };

  const processBarcode = (barcode: string) => {
    if (barcode && isEditing) {
      const basePackIdSearch = barcode.length >= 14 ? barcode.slice(0, 11) : (barcode.length > 5 ? barcode.slice(0, -3) : barcode);
      const scannedTicketNum = barcode.length >= 14 ? parseInt(barcode.slice(11, 14), 10) : (barcode.length > 5 ? parseInt(barcode.slice(-3), 10) : null);

      if (scannedTicketNum !== null && !isNaN(scannedTicketNum)) {
        // verify it's part of the audit
        const existingDetail = selectedAudit?.details?.find(d => d.packId === basePackIdSearch);
        if (existingDetail) {
          setEditedDetails(prev => ({
            ...prev,
            [existingDetail.packId]: scannedTicketNum
          }));
        }
      }
      setScannerInput('');
    }
  };

  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = scannerInput.trim();
    processBarcode(barcode);
  };

  const handleSaveEdits = async () => {
    if (!selectedAudit) return;
    
    let salesTotal = 0;
    let discrepancies = 0;
    const newDetails: any[] = [];
    
    selectedAudit.details?.forEach(detail => {
      const matchPack = packs.find(p => p.id === detail.packId);
      const packPrice = matchPack ? matchPack.price : (detail.sold > 0 ? (detail.revenue / detail.sold) : 0);
      
      const newEndTicket = editedDetails[detail.packId] ?? detail.endTicket;
      const sold = detail.startTicket - newEndTicket;
      
      if (sold > 0) salesTotal += sold * packPrice;
      if (sold < 0) discrepancies += 1;
      
      newDetails.push({
        ...detail,
        endTicket: newEndTicket,
        sold,
        revenue: sold * packPrice
      });
      
      if (matchPack && matchPack.currentTicket !== newEndTicket) {
        updatePackTicket(detail.packId, newEndTicket);
      }
    });

    const netDueNum = parseFloat(editedNetDue) || 0;
    const newTotalCash = salesTotal + netDueNum;

    const newAudit = {
      ...selectedAudit,
      discrepancies,
      salesCalculated: salesTotal,
      netDue: netDueNum,
      totalCash: newTotalCash,
      details: newDetails,
      status: discrepancies > 0 ? 'Flagged' : 'Clean',
    };
    
    await updateAudit(selectedAudit.id, {
      discrepancies,
      salesCalculated: salesTotal,
      netDue: netDueNum,
      totalCash: newTotalCash,
      details: newDetails,
      status: discrepancies > 0 ? 'Flagged' : 'Clean',
    });
    
    setSelectedAudit(newAudit as AuditRecord);
    setIsEditing(false);
  };


  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Shift Audits</h1>
          <p className="text-slate-500 mt-1">Review recent reconciliations and investigate discrepancies.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Audit ID or Employee..." 
              className="w-full pl-9 pr-4 py-2 flex items-center gap-3 rounded-lg bg-slate-50 px-3 text-sm font-medium border border-transparent focus:bg-white focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Audit ID</th>
                <th className="py-3 px-6">Date & Time</th>
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Shift</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Calculated Sales</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No recent shift audits to display. Complete a shift audit to generate a report.
                  </td>
                </tr>
              ) : (
                audits.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedAudit(row)}>
                  <td className="py-4 px-6 font-mono font-medium text-blue-600">{row.id}</td>
                  <td className="py-4 px-6 text-slate-900">{row.date}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{row.employee}</td>
                  <td className="py-4 px-6 text-slate-600">{row.shift}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold select-none border",
                      row.status === 'Clean' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      row.status === 'Flagged' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {row.discrepancies > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900">${row.salesCalculated}</span>
                        <div className="flex items-center text-red-600 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {row.discrepancies} Discrepancies
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900">${row.salesCalculated}</span>
                        <div className="flex items-center text-slate-500 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-slate-400" />
                          Matched
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedAudit(row); }}
                      className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 hover:bg-blue-50 rounded-lg"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    {/* Audit Review Modal */}
    {selectedAudit && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {isEditing ? 'Correct Audit' : 'Audit Details'}
                </h2>
                {!isEditing && (
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold select-none border",
                    selectedAudit.status === 'Clean' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    selectedAudit.status === 'Flagged' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  )}>
                    {selectedAudit.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {isEditing 
                  ? 'Scan a scratcher to quickly update its remaining tickets, or edit values directly below.'
                  : <>Audit <strong className="text-slate-700">{selectedAudit.id}</strong> conducted by <strong className="text-slate-700">{selectedAudit.employee}</strong> on {selectedAudit.date} ({selectedAudit.shift} Shift)</>
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {useCamera ? (
                <CameraScanner 
                  onScan={handleCameraScan} 
                  onClose={() => setUseCamera(false)} 
                />
              ) : null}

              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseCamera(true)}
                    className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                    title="Use Device Camera"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <form onSubmit={handleScannerSubmit} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={scannerInput}
                      onChange={(e) => setScannerInput(e.target.value)}
                      placeholder="Scan ticket..."
                      className="pl-9 pr-3 py-1.5 w-32 sm:w-auto text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </form>
                </div>
              )}
              <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            <div className="flex gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Sold</p>
                <p className="text-2xl font-bold text-slate-900">${selectedAudit.salesCalculated.toLocaleString()}</p>
              </div>
              {selectedAudit.netDue !== undefined && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Net Due</p>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={editedNetDue}
                        onChange={(e) => setEditedNetDue(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                      />
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">${selectedAudit.netDue.toLocaleString()}</p>
                  )}
                </div>
              )}
              {selectedAudit.totalCash !== undefined && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex-1">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Total Cash</p>
                  <p className="text-2xl font-bold text-emerald-800">${selectedAudit.totalCash.toLocaleString()}</p>
                </div>
              )}
              <div className={cn("p-4 rounded-xl border flex-1", selectedAudit.discrepancies > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100")}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", selectedAudit.discrepancies > 0 ? "text-red-600" : "text-emerald-700")}>Discrepancies</p>
                <p className={cn("text-2xl font-bold", selectedAudit.discrepancies > 0 ? "text-red-700" : "text-emerald-700")}>
                  {selectedAudit.discrepancies}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Pack-by-Pack Breakdown</h3>
            
            {(!selectedAudit.details || selectedAudit.details.length === 0) ? (
              <div className="text-center p-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                No individual pack details were recorded for this audit.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Game & Pack ID</th>
                      <th className="px-4 py-3 font-semibold text-center">Start #</th>
                      <th className="px-4 py-3 font-semibold text-center">End #</th>
                      <th className="px-4 py-3 font-semibold text-center">Tickets Sold</th>
                      <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedAudit.details.map((detail, idx) => {
                      const currentEndTicket = isEditing ? (editedDetails[detail.packId] ?? detail.endTicket) : detail.endTicket;
                      const currentSold = detail.startTicket - currentEndTicket;
                      const packPrice = detail.sold > 0 ? (detail.revenue / detail.sold) : 0;
                      const currentRevenue = currentSold * packPrice;

                      return (
                      <tr key={idx} className={cn("hover:bg-slate-50 transition-colors", currentSold < 0 ? "bg-red-50/50" : "")}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{detail.game}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{detail.packId}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 font-mono">{detail.startTicket}</td>
                        <td className="px-4 py-3 text-center font-mono font-medium text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              inputMode="text"
                              value={currentEndTicket}
                              onChange={(e) => setEditedDetails({ ...editedDetails, [detail.packId]: Number(e.target.value) })}
                              className="w-20 px-2 py-1 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-center font-mono"
                            />
                          ) : (
                            detail.endTicket
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {currentSold > 0 ? (
                            <span className="text-emerald-600 font-medium">{currentSold} sold</span>
                          ) : currentSold < 0 ? (
                            <span className="text-red-600 font-medium flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Error
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {currentRevenue > 0 ? `$${currentRevenue.toLocaleString()}` : '$0'}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdits} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Corrections
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  <Edit3 className="h-4 w-4" /> Correct Audit
                </button>
                <button onClick={() => setSelectedAudit(null)} className="px-6 py-2.5 bg-slate-800 border border-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors">
                  Close Detail View
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
}
