import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ScanResult } from '../types';
import { 
  initializeCamera, 
  stopCamera, 
  startScanning,
  isCameraActive 
} from '../services/qrScannerService';
import { SCAN_TIMEOUT } from '../constants';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [scanStatus, setScanStatus] = useState<'initializing' | 'scanning' | 'detected' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleDetection = useCallback((result: ScanResult) => {
    setScanStatus('detected');
    // Small delay for visual feedback
    setTimeout(() => {
      onScanComplete(result);
    }, 500);
  }, [onScanComplete]);

  const handleError = useCallback((error: Error) => {
    setScanStatus('error');
    setErrorMessage(error.message);
    onError(error.message);
  }, [onError]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initScanner = async () => {
      try {
        // Initialize camera
        const stream = await initializeCamera();
        
        if (!mounted || !videoRef.current) return;
        
        // Attach stream to video element
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setIsInitializing(false);
        setScanStatus('scanning');
        
        // Start QR detection
        const cleanup = await startScanning(
          videoRef.current,
          handleDetection,
          handleError
        );
        
        cleanupRef.current = cleanup;
        
        // Set timeout for scanning
        timeoutId = setTimeout(() => {
          if (mounted && scanStatus === 'scanning') {
            handleError(new Error('Scan timeout. No QR code detected. Please try again.'));
          }
        }, SCAN_TIMEOUT);
        
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Failed to initialize scanner';
          setScanStatus('error');
          setErrorMessage(message);
          setIsInitializing(false);
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      stopCamera();
    };
  }, [handleDetection, handleError]);

  const handleRetry = () => {
    setErrorMessage(null);
    setScanStatus('initializing');
    setIsInitializing(true);
    // Re-mount will trigger useEffect
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onCancel}
          className="p-2 text-white hover:text-xr-accent transition-colors"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <span className="text-white font-medium">Scan QR Code</span>
        <div className="w-8"></div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Scan Frame */}
          <div className={`relative w-64 h-64 ${scanStatus === 'detected' ? 'scale-95' : ''} transition-transform duration-300`}>
            {/* Corner markers */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg ${
              scanStatus === 'detected' ? 'border-green-500' : 'border-xr-accent'
            } transition-colors`}></div>
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg ${
              scanStatus === 'detected' ? 'border-green-500' : 'border-xr-accent'
            } transition-colors`}></div>
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg ${
              scanStatus === 'detected' ? 'border-green-500' : 'border-xr-accent'
            } transition-colors`}></div>
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg ${
              scanStatus === 'detected' ? 'border-green-500' : 'border-xr-accent'
            } transition-colors`}></div>

            {/* Scan line animation */}
            {scanStatus === 'scanning' && (
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-xr-accent to-transparent animate-scan-line"></div>
            )}

            {/* Detection checkmark */}
            {scanStatus === 'detected' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <i className="fas fa-check text-white text-3xl"></i>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dark overlay outside scan area */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent" 
               style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}></div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-center">
          {isInitializing && (
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="w-5 h-5 border-2 border-xr-accent border-t-transparent rounded-full animate-spin"></div>
              <span>Initializing camera...</span>
            </div>
          )}

          {scanStatus === 'scanning' && !isInitializing && (
            <div className="text-white">
              <p className="text-lg font-medium mb-1">Point at QR Code</p>
              <p className="text-xr-dim text-sm">Position the QR code within the frame</p>
            </div>
          )}

          {scanStatus === 'detected' && (
            <div className="text-green-400">
              <p className="text-lg font-medium">QR Code Detected!</p>
              <p className="text-sm">Loading profile...</p>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="text-center">
              <p className="text-red-400 mb-3">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-xr-accent text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Demo helper - for testing without real QR codes */}
        {scanStatus === 'scanning' && !isInitializing && (
          <div className="mt-4 text-center">
            <p className="text-xr-dim text-xs mb-2">Demo Mode: Tap to simulate scan</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['p001', 'p002', 'p003', 'p004'].map(id => (
                <button
                  key={id}
                  onClick={() => handleDetection({ participantId: id, timestamp: new Date(), raw: id })}
                  className="px-3 py-1 bg-xr-panel/80 text-xr-dim text-xs rounded hover:text-white transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
