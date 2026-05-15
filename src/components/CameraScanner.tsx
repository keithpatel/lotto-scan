import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

/**
 * Force-stop ALL active camera/media streams on the page.
 * On iOS Safari, orphaned MediaStream tracks cause the system to think
 * a hardware keyboard/accessory is connected, which suppresses the
 * virtual keyboard for ~2 minutes across ALL apps.
 */
function stopAllCameraStreams() {
  try {
    // Stop all video elements on the page
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const stream = video.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        video.srcObject = null;
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    });

    // Also stop any active navigator.mediaDevices tracks
    // This catches streams that may not be attached to a video element
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {});
    }

    // Remove any iframe video elements that Html5QrcodeScanner creates
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.querySelectorAll('video').forEach((video: HTMLVideoElement) => {
            const stream = video.srcObject as MediaStream | null;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            video.srcObject = null;
          });
        }
      } catch (e) {}
    });
  } catch (e) {
    console.warn('[CameraScanner] Error stopping camera streams:', e);
  }
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref for onScan so the useEffect doesn't re-run when the callback changes
  // (parent doesn't wrap it in useCallback, so it changes every render)
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    hasScannedRef.current = false;
    
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
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Prevent double-scan
        if (hasScannedRef.current) return;
        hasScannedRef.current = true;
        
        // CRITICAL: Stop scanner and ALL camera tracks BEFORE calling onScan
        scanner.clear()
          .catch(() => {})
          .finally(() => {
            // Force-kill any remaining camera streams
            stopAllCameraStreams();
            scannerRef.current = null;
            
            // Small delay to let iOS fully release the camera hardware
            setTimeout(() => {
              onScanRef.current(decodedText);
            }, 200);
          });
      },
      (errorMessage) => {
        // Normal - happens continuously when no barcode is in view
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
          .catch(() => {})
          .finally(() => {
            stopAllCameraStreams();
            scannerRef.current = null;
          });
      } else {
        // Scanner was already cleared in success callback, but force-stop streams anyway
        stopAllCameraStreams();
      }
    };
  }, []); // Empty deps — scanner is created exactly once

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <h2 className="font-medium">Scan Barcode</h2>
        </div>
        <button 
          onClick={() => {
            // Stop camera before closing
            if (scannerRef.current) {
              scannerRef.current.clear().catch(() => {}).finally(() => {
                stopAllCameraStreams();
                onClose();
              });
            } else {
              stopAllCameraStreams();
              onClose();
            }
          }} 
          className="p-2 bg-slate-800 rounded-full hover:bg-slate-700"
        >
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
      `}
      </style>
    </div>
  );
}
