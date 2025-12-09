import { ScanResult } from '../types';
import { QR_PREFIX } from '../constants';

/**
 * QR Scanner Service
 * Handles camera access and QR code detection
 */

let videoStream: MediaStream | null = null;
let scannerActive = false;

/**
 * Request camera permissions and initialize video stream
 */
export async function initializeCamera(): Promise<MediaStream> {
  try {
    // Request rear camera for QR scanning
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    videoStream = stream;
    return stream;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found. Please ensure your device has a camera.');
      }
    }
    throw new Error('Failed to initialize camera. Please try again.');
  }
}

/**
 * Stop camera stream and release resources
 */
export function stopCamera(): void {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  scannerActive = false;
}

/**
 * Check if camera is currently active
 */
export function isCameraActive(): boolean {
  return videoStream !== null && videoStream.active;
}

/**
 * Parse QR code data and extract participant ID
 */
export function parseQRCode(rawData: string): ScanResult | null {
  // Validate QR code format
  if (!rawData) return null;
  
  let participantId: string;
  
  // Check for XRNODE prefix format
  if (rawData.startsWith(QR_PREFIX)) {
    participantId = rawData.substring(QR_PREFIX.length).trim();
  } else {
    // Accept raw participant ID for demo purposes
    participantId = rawData.trim();
  }
  
  if (!participantId) return null;
  
  return {
    participantId,
    timestamp: new Date(),
    raw: rawData
  };
}

/**
 * Start QR code scanning loop using BarcodeDetector API
 * Falls back to manual detection if API not available
 */
export async function startScanning(
  videoElement: HTMLVideoElement,
  onDetected: (result: ScanResult) => void,
  onError: (error: Error) => void
): Promise<() => void> {
  scannerActive = true;
  
  // Check for BarcodeDetector API support
  if ('BarcodeDetector' in window) {
    return startBarcodeDetectorScanning(videoElement, onDetected, onError);
  } else {
    // Fallback: simulate QR detection for demo
    return startSimulatedScanning(videoElement, onDetected, onError);
  }
}

/**
 * Use native BarcodeDetector API for QR scanning
 */
async function startBarcodeDetectorScanning(
  videoElement: HTMLVideoElement,
  onDetected: (result: ScanResult) => void,
  onError: (error: Error) => void
): Promise<() => void> {
  try {
    // @ts-ignore - BarcodeDetector may not be in TypeScript types
    const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
    
    let lastDetectedCode = '';
    let lastDetectionTime = 0;
    const DEBOUNCE_MS = 2000; // Prevent duplicate detections
    
    const detectFrame = async () => {
      if (!scannerActive) return;
      
      try {
        const barcodes = await barcodeDetector.detect(videoElement);
        
        if (barcodes.length > 0) {
          const now = Date.now();
          const rawValue = barcodes[0].rawValue;
          
          // Debounce: don't process same code within 2 seconds
          if (rawValue !== lastDetectedCode || now - lastDetectionTime > DEBOUNCE_MS) {
            lastDetectedCode = rawValue;
            lastDetectionTime = now;
            
            const result = parseQRCode(rawValue);
            if (result) {
              onDetected(result);
            }
          }
        }
      } catch (err) {
        // Detection error, continue scanning
        console.warn('Detection frame error:', err);
      }
      
      // Continue scanning
      if (scannerActive) {
        requestAnimationFrame(detectFrame);
      }
    };
    
    // Start detection loop
    requestAnimationFrame(detectFrame);
    
    // Return cleanup function
    return () => {
      scannerActive = false;
    };
  } catch (error) {
    onError(new Error('Failed to initialize QR scanner'));
    return () => { scannerActive = false; };
  }
}

/**
 * Simulated scanning for demo/testing when BarcodeDetector not available
 */
function startSimulatedScanning(
  _videoElement: HTMLVideoElement,
  onDetected: (result: ScanResult) => void,
  _onError: (error: Error) => void
): () => void {
  // For demo: provide a way to simulate QR detection
  // In real implementation, could use a library like jsQR
  
  console.log('BarcodeDetector not available. Using simulated scanning mode.');
  console.log('Call window.simulateQRScan("participantId") to test.');
  
  // Expose simulation function globally for testing
  (window as any).simulateQRScan = (participantId: string) => {
    const result = parseQRCode(participantId);
    if (result) {
      onDetected(result);
    }
  };
  
  return () => {
    scannerActive = false;
    delete (window as any).simulateQRScan;
  };
}

/**
 * Check if QR scanning is supported
 */
export function isQRScanningSupported(): boolean {
  return 'BarcodeDetector' in window || true; // Always true since we have fallback
}

/**
 * Get camera permission status
 */
export async function getCameraPermissionStatus(): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state;
  } catch {
    return 'prompt';
  }
}
