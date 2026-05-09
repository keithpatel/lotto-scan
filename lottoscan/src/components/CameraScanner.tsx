import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 300, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // We log warnings to console, errors usually happen when no code is found continuously.
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <h2 className="font-medium">Scan Barcode</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center bg-black relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-sm z-10 text-center">
            {error}
          </div>
        )}
        <div id="reader" className="w-full h-full max-h-[80vh] bg-black"></div>
      </div>
      
      <div className="p-6 bg-slate-900 text-center text-slate-400 text-sm">
        Point the camera at the scratcher barcode.
      </div>
      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: white !important; }
        #reader button { background: #3b82f6 !important; color: white !important; border: none !important; padding: 8px 16px !important; border-radius: 8px !important; font-weight: 500 !important; cursor: pointer !important; }
        #reader select { background: #1e293b !important; color: white !important; border: 1px solid #334155 !important; padding: 8px !important; border-radius: 8px !important; margin-bottom: 12px !important; }
      `}</style>
    </div>
  );
}
