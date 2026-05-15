import React, { useState, useEffect, useRef } from 'react';
import { X, Barcode, CheckCircle2, Camera } from 'lucide-react';
import { useStore, Pack } from '@/contexts/StoreContext';
import { CameraScanner } from './CameraScanner';

interface ActivatePackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Prevents iOS zoom (font-size >= 16px is critical) and suppresses double-tap zoom
const INPUT_STYLE: React.CSSProperties = {
  fontSize: '16px',
  touchAction: 'manipulation',
};

export function ActivatePackModal({ isOpen, onClose }: ActivatePackModalProps) {
  const { addPack, packs } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'SCAN' | 'DETAILS' | 'SUCCESS'>('SCAN');
  const [barcode, setBarcode] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  
  const [price, setPrice] = useState('');
  const [game, setGame] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const priceRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setStep('SCAN');
      setBarcode('');
      setUseCamera(false);
    }
  }, [isOpen]);

  // On iOS we do NOT programmatically focus — only a direct user tap opens the keyboard.
  useEffect(() => {
    if (step === 'DETAILS') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIOS) {
        setTimeout(() => {
          priceRef.current?.focus();
        }, 100);
      }
    }
  }, [step]);

  const handleCameraScan = (decodedText: string) => {
    setBarcode(decodedText);
    setUseCamera(false);
    processBarcode(decodedText);
  };

  const processBarcode = (rawBarcode: string) => {
    rawBarcode = rawBarcode.trim();
    if (rawBarcode) {
      const basePackId = rawBarcode.length >= 14 ? rawBarcode.slice(0, 11) : (rawBarcode.length > 5 ? rawBarcode.slice(0, -3) : rawBarcode);
      if (packs.find(p => p.id === rawBarcode || p.id === basePackId)) {
        alert("This pack is already activated!");
        setBarcode('');
        return;
      }

      const gameNumStr = rawBarcode.length >= 4 ? rawBarcode.slice(0, 4) : '';
      const matchedPack = packs.find(p => p.id.startsWith(gameNumStr));
      
      if (inputRef.current) {
        inputRef.current.blur();
      }
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setTimeout(() => {
        setStep('DETAILS');
      }, 50);
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.blur();
    }
    processBarcode(barcode);
  };

  const handleActivate = () => {
    const rawBarcode = barcode.trim();
    const basePackId = rawBarcode.length >= 14 ? rawBarcode.slice(0, 11) : (rawBarcode.length > 5 ? rawBarcode.slice(0, -3) : `MANUAL-${Date.now()}`);
    const initialTicketNum = rawBarcode.length >= 14 ? parseInt(rawBarcode.slice(11, 14), 10) : (rawBarcode.length > 5 ? parseInt(rawBarcode.slice(-3), 10) : 0);

    const newPack: Pack = {
      id: basePackId,
      game: game,
      price: Number(price),
      pack: basePackId,
      status: 'Active',
      location: 'Register 1',
      activatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      totalTickets: Number(totalTickets),
      currentTicket: isNaN(initialTicketNum) ? 0 : initialTicketNum,
    };
    
    addPack(newPack);
    setStep('SUCCESS');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Barcode className="h-5 w-5" />
            <h2 className="font-semibold text-slate-900">Activate New Pack</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {step === 'SCAN' && (
            <>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Scan the barcode on the new pack to activate it in the system.
              </p>
              
              {useCamera ? (
                <CameraScanner 
                  onScan={handleCameraScan} 
                  onClose={() => setUseCamera(false)} 
                />
              ) : null}

              <form onSubmit={handleScanSubmit}>
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full text-center text-lg font-mono tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Waiting for scanner..."
                  style={INPUT_STYLE}
                />
              </form>
              
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setUseCamera(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Device Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (inputRef.current) inputRef.current.blur();
                    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                    setTimeout(() => setStep('DETAILS'), 50);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <span>Enter Manually</span>
                </button>
              </div>

              <div className="mt-8 flex justify-center">
                 <div className="relative flex items-center justify-center h-32 w-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
                        <div className="w-full h-[2px] bg-blue-500/80 shadow-[0_0_12px_2px_rgba(59,130,246,0.8)] animate-pulse"></div>
                    </div>
                    <Barcode className="h-16 w-16 text-slate-300" strokeWidth={1} />
                 </div>
              </div>
            </>
          )}

          {step === 'DETAILS' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between mb-4 border border-slate-100">
                <span className="text-sm text-slate-500">Scanned Barcode:</span>
                <span className="font-mono text-sm font-semibold text-slate-900">{barcode}</span>
              </div>
              
              {/*
                FIX FOR iOS SAFARI "AutoFill Contact" KEYBOARD BLOCK:
                - Wrap in a <form> with role="presentation" so Safari doesn't treat it as a real form
                - Use random/nonsensical name= attributes so Safari can't pattern-match to contacts
                - Use autoComplete with random strings (Safari ignores "off" but obeys unknown values)
                - Hidden dummy fields absorb any remaining autofill detection
                - data-lpignore / data-1p-ignore suppress password manager overlays
              */}
              <form
                autoComplete="off"
                role="presentation"
                data-form-type="other"
                onSubmit={(e) => { e.preventDefault(); handleActivate(); }}
              >
                {/* Hidden dummy fields to absorb Safari autofill detection */}
                <input type="text" name="fakeuser_xz9" autoComplete="nope" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
                <input type="text" name="fakepwd_xz9" autoComplete="nope" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Game Name</label>
                  <input 
                    type="search"
                    name="lotto_gx_928374"
                    inputMode="text"
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm touch-manipulation"
                    style={INPUT_STYLE}
                    placeholder="Enter game name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ticket Price</label>
                    <input 
                      ref={priceRef}
                      type="search"
                      name="lotto_px_716253"
                      inputMode="text"
                      autoComplete="nope"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg touch-manipulation"
                      style={INPUT_STYLE}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tickets</label>
                    <input 
                      type="search"
                      name="lotto_tx_493827"
                      inputMode="text"
                      autoComplete="nope"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={totalTickets}
                      onChange={(e) => setTotalTickets(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg touch-manipulation"
                      style={INPUT_STYLE}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Confirm & Activate
                </button>
              </form>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Pack Activated!</h3>
              <p className="text-slate-500 text-sm mt-1">Pack is now tracked in active inventory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
