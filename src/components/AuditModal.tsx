import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, ArrowRight, Barcode, CheckCircle2, Camera } from 'lucide-react';
import { useStore, Pack } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { CameraScanner } from './CameraScanner';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditModal({ isOpen, onClose }: AuditModalProps) {
  const { packs, updatePackTicket, updatePack, addAudit, activeShift, endShift } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const ticketInputRef = useRef<HTMLInputElement>(null);
  
  const activePacks = packs.filter(p => p.status === 'Active');
  
  // Audited data: map of packId -> ending ticket number
  const [auditedTickets, setAuditedTickets] = useState<Record<string, number>>({});
  
  // Scanner state
  const [useCamera, setUseCamera] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [ticketInput, setTicketInput] = useState('');

  // Summary state
  const [step, setStep] = useState<'scan' | 'summary'>('scan');
  const [netDueInput, setNetDueInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuditedTickets({});
      setScannerInput('');
      setUseCamera(false);
      setSelectedPackId(null);
      setStep('scan');
      setNetDueInput('');
    }
  }, [isOpen]);

  const handleCameraScan = (decodedText: string) => {
    setScannerInput(decodedText);
    setUseCamera(false);
    processBarcode(decodedText);
  };

  const processBarcode = (barcode: string) => {
    barcode = barcode.trim();
    if (barcode && step === 'scan') {
      const basePackIdSearch = barcode.length >= 14 ? barcode.slice(0, 11) : (barcode.length > 5 ? barcode.slice(0, -3) : barcode);
      const scannedTicketNum = barcode.length >= 14 ? parseInt(barcode.slice(11, 14), 10) : (barcode.length > 5 ? parseInt(barcode.slice(-3), 10) : null);

      const foundPack = activePacks.find(p => p.id === barcode || p.id === basePackIdSearch);
      if (foundPack) {
        if (scannedTicketNum !== null && !isNaN(scannedTicketNum)) {
          // Auto-save the audited ticket
          setAuditedTickets(prev => ({ ...prev, [foundPack.id]: scannedTicketNum }));
          // Give focus back to scanner
          setTimeout(() => inputRef.current?.focus(), 100);
        } else {
          setSelectedPackId(foundPack.id);
          setTicketInput(String(foundPack.currentTicket));
        }
      } else {
        alert("Pack not found or not active!");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      setScannerInput('');
    }
  };

  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcode(scannerInput);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackId && ticketInput !== '') {
      const num = parseInt(ticketInput);
      setAuditedTickets(prev => ({ ...prev, [selectedPackId]: num }));
      setSelectedPackId(null);
      setTicketInput('');
    }
  };

  const salesCalculated = Object.entries(auditedTickets).reduce((acc, [packId, endingNum]) => {
    const pack = activePacks.find(p => p.id === packId);
    if (pack && endingNum !== undefined) {
      const sold = pack.currentTicket - Number(endingNum);
      if (sold > 0) acc += sold * pack.price;
    }
    return acc;
  }, 0);

  const netDue = parseFloat(netDueInput) || 0;
  const totalCash = salesCalculated + netDue;

  const handleFinishAudit = () => {
    let salesTotal = 0;
    let discrepancies = 0;
    const auditDetails: any[] = [];

    Object.entries(auditedTickets).forEach(([packId, endingNum]) => {
      const pack = activePacks.find(p => p.id === packId);
      if (pack && endingNum !== undefined) {
        const sold = pack.currentTicket - Number(endingNum);
        if (sold > 0) salesTotal += sold * pack.price;
        if (sold < 0) discrepancies += 1; 
        
        auditDetails.push({
          packId: pack.id,
          game: pack.game,
          startTicket: pack.currentTicket,
          endTicket: Number(endingNum),
          sold: sold,
          revenue: sold * pack.price
        });

        updatePackTicket(packId, Number(endingNum));
      }
    });

    // Auto-mark un-scanned packs as Sold Out
    activePacks.forEach(pack => {
      if (!auditedTickets[pack.id]) {
        // Pack not scanned - assume all sold out
        const sold = pack.totalTickets - pack.currentTicket + 1;
        if (sold > 0) salesTotal += sold * pack.price;
        
        auditDetails.push({
          packId: pack.id,
          game: pack.game,
          startTicket: pack.currentTicket,
          endTicket: 0,
          sold: sold,
          revenue: sold * pack.price,
          soldOut: true
        });

        // Update pack to Sold Out status
        updatePack(pack.id, {
          status: 'Sold Out',
          currentTicket: pack.totalTickets + 1
        });
      }
    });

    addAudit({
      id: `AUD-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      employee: activeShift?.employeeName || 'Unknown Employee',
      shift: new Date().getHours() < 12 ? 'Morning' : 'Evening',
      status: discrepancies > 0 ? 'Flagged' : 'Clean',
      discrepancies,
      salesCalculated: salesTotal,
      netDue: netDue,
      totalCash: totalCash,
      details: auditDetails,
      shiftId: activeShift?.id
    });

    if (activeShift) {
      endShift(activeShift.id);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Shift End Audit</h2>
            <p className="text-sm text-slate-500 mt-1">Scan packs and enter their current ticket numbers to calculate sales.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-xl transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {step === 'scan' ? (
            <>
              {/* Left panel: Scanner & Input */}
              <div className="w-1/2 p-6 border-r border-slate-100 bg-white flex flex-col">
                {selectedPackId ? (
                  <div className="flex flex-col h-full justify-center">
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Selected Pack</div>
                      <h3 className="text-lg font-bold text-slate-900">{activePacks.find(p => p.id === selectedPackId)?.game}</h3>
                      <div className="text-sm text-slate-500 font-mono mt-1">Barcode: {selectedPackId}</div>
                      <div className="mt-2 text-sm text-slate-600">
                        Previous ticket: <strong className="text-slate-900">{activePacks.find(p => p.id === selectedPackId)?.currentTicket}</strong>
                      </div>
                    </div>
                    
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enter Next Ticket Number:</label>
                        <input
                          ref={ticketInputRef}
                          autoFocus
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          value={ticketInput}
                          onChange={(e) => setTicketInput(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 bg-blue-50 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-text"
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button 
                          type="button" 
                          onClick={() => { setSelectedPackId(null); }}
                          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
                        >
                          Save Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-center text-center">
                    <div className="mx-auto h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100">
                      <Barcode className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Scan a Pack</h3>
                    <p className="text-slate-500 text-sm mb-6">Point your scanner at any active scratcher pack to record its current ticket number.</p>
                    
                    {useCamera ? (
                      <CameraScanner 
                        onScan={handleCameraScan} 
                        onClose={() => setUseCamera(false)} 
                      />
                    ) : null}

                    <form onSubmit={handleScannerSubmit}>
                      <input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        value={scannerInput}
                        onChange={(e) => setScannerInput(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full text-center text-sm font-mono tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                        placeholder="Waiting for scanner input..."
                      />
                    </form>
                    
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setUseCamera(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Use Device Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right panel: Active Packs List */}
              <div className="w-1/2 p-0 bg-slate-50 overflow-y-auto">
                <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                  <h3 className="text-sm font-semibold text-slate-800">Shift Progress</h3>
                  <p className="text-xs text-slate-500 mt-1">Packs Audited: {Object.keys(auditedTickets).length} / {activePacks.length}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {activePacks.map(pack => {
                    const auditedVal = auditedTickets[pack.id];
                    const isAudited = auditedVal !== undefined;
                    const sold = isAudited ? Math.max(0, pack.currentTicket - auditedVal) : 0;
                    
                    return (
                      <div 
                        key={pack.id} 
                        className={cn(
                          "p-4 flex flex-col gap-2 transition-colors cursor-pointer hover:bg-slate-100",
                          isAudited ? "bg-emerald-50/50" : ""
                        )}
                        onClick={() => { setSelectedPackId(pack.id); setTicketInput(String(pack.currentTicket)); }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">{pack.game}</span>
                              {isAudited && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">Barcode: {pack.id}</div>
                          </div>
                          <div className="text-right">
                            {isAudited ? (
                              <>
                                <div className="text-xs font-semibold text-emerald-600">${sold * pack.price} Sales</div>
                                <div className="text-[10px] text-slate-500">{sold} tickets sold</div>
                              </>
                            ) : (
                              <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded">Pending</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Start: {pack.currentTicket}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className={cn("px-1.5 py-0.5 rounded font-medium", isAudited ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-400")}>
                            End: {isAudited ? auditedVal : '?'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {activePacks.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No active packs found.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-8 bg-slate-50 flex flex-col items-center justify-center overflow-y-auto">
              <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <Calculator className="h-12 w-12 text-blue-600 mb-6 mx-auto bg-blue-50 p-2 rounded-xl" />
                <h3 className="text-xl font-bold text-slate-900 text-center mb-6">Calculate Total Cash</h3>
                
                <div className="space-y-4 text-base mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Total Sold (Calculated)</span>
                    <span className="font-semibold text-slate-900">${salesCalculated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium flex items-center">
                      Net Due
                    </span>
                    <div className="flex items-center">
                      <span className="text-slate-500 mr-2">$</span>
                      <input 
                          type="text" 
                          inputMode="text"
                          autoComplete="off"
                          value={netDueInput}
                          onChange={(e) => setNetDueInput(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          className="w-24 text-right px-2 py-1 border border-slate-300 rounded font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-text"
                        />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-emerald-50 px-4 rounded-xl border border-emerald-100">
                    <span className="text-emerald-800 font-bold">Total Cash Expected</span>
                    <span className="font-bold text-xl text-emerald-700">${totalCash.toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-center text-slate-500">
                  Ensure the physical cash collected matches the total above before finalizing.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="text-sm font-medium text-slate-600">
               {step === 'scan' ? 'Click any pack to enter manually if scanner fails.' : 'Review final amounts above.'}
             </div>
             {step === 'scan' ? (
               <button 
                  onClick={() => setStep('summary')}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Review Audit
               </button>
             ) : (
               <div className="flex gap-3">
                 <button 
                    onClick={() => { setStep('scan');  }}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back to Scan
                 </button>
                 <button 
                    onClick={handleFinishAudit}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    Confirm & Complete Audit
                 </button>
               </div>
             )}
        </div>
      </div>
    </div>
  );
}