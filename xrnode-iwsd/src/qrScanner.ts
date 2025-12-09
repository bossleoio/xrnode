/**
 * QR Scanner System for IWSDK
 * Handles QR code detection in AR/VR environment
 * Uses BarcodeDetector API when available, falls back to demo mode
 */

import {
  createSystem,
  World,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  CanvasTexture,
  DoubleSide,
} from "@iwsdk/core";

import { getProfileById, parseQRCode } from './services/profileService.js';
import { analyzeMatch, getAuraColor, getMatchLevel } from './services/matchingService.js';
import { Profile, MatchResult, ScanResult } from './services/types.js';
import { PARTICIPANT_DATABASE } from './services/constants.js';

// BarcodeDetector type declaration
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetector;
  }
  interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }
  interface DetectedBarcode {
    rawValue: string;
    format: string;
    boundingBox: DOMRectReadOnly;
  }
}

// Simulated current user profile (would come from auth in production)
const CURRENT_USER: Profile = PARTICIPANT_DATABASE[2]; // Marlaina

export interface QRScanState {
  isScanning: boolean;
  lastScan: ScanResult | null;
  scannedProfile: Profile | null;
  matchResult: MatchResult | null;
}

let scanState: QRScanState = {
  isScanning: false,
  lastScan: null,
  scannedProfile: null,
  matchResult: null
};

// Callbacks for scan events
type ScanCallback = (profile: Profile, matchResult: MatchResult) => void;
const scanCallbacks: ScanCallback[] = [];

/**
 * Register callback for successful scans
 */
export function onScanComplete(callback: ScanCallback): void {
  scanCallbacks.push(callback);
}

/**
 * Get current scan state
 */
export function getScanState(): QRScanState {
  return { ...scanState };
}

/**
 * Simulate QR code scan (for demo purposes)
 * In production, this would use camera-based detection
 */
export function simulateScan(participantId: string): boolean {
  const profile = getProfileById(participantId);
  
  if (!profile) {
    console.error('Profile not found for ID:', participantId);
    return false;
  }

  const matchResult = analyzeMatch(CURRENT_USER, profile);
  
  scanState = {
    isScanning: false,
    lastScan: {
      participantId,
      rawData: `XRNODE:${participantId}`,
      timestamp: new Date()
    },
    scannedProfile: profile,
    matchResult
  };

  // Notify callbacks
  scanCallbacks.forEach(cb => cb(profile, matchResult));

  console.log(`Scanned: ${profile.name}, Match: ${matchResult.score}%`);
  return true;
}

/**
 * Create a profile card mesh for 3D display
 */
export function createProfileCard(
  profile: Profile,
  matchResult: MatchResult
): Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Background with aura glow
  const auraColor = getAuraColor(matchResult.matchLevel);
  
  // Draw glow effect
  const gradient = ctx.createRadialGradient(256, 320, 100, 256, 320, 300);
  gradient.addColorStop(0, auraColor + '40');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 640);

  // Card background
  ctx.fillStyle = '#1a1a2e';
  ctx.roundRect(40, 40, 432, 560, 20);
  ctx.fill();

  // Border with aura color
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 4;
  ctx.roundRect(40, 40, 432, 560, 20);
  ctx.stroke();

  // Profile image placeholder
  ctx.fillStyle = '#2a2a4e';
  ctx.beginPath();
  ctx.arc(256, 150, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(profile.name, 256, 250);

  // Role & Company
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '20px Arial';
  ctx.fillText(`${profile.role} at ${profile.company}`, 256, 285);

  // Match score
  ctx.fillStyle = auraColor;
  ctx.font = 'bold 48px Arial';
  ctx.fillText(`${matchResult.score}%`, 256, 360);

  ctx.fillStyle = '#808080';
  ctx.font = '16px Arial';
  ctx.fillText('MATCH', 256, 385);

  // Match reasons
  ctx.fillStyle = '#c0c0c0';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  matchResult.reasons.slice(0, 3).forEach((reason, i) => {
    ctx.fillText(`• ${reason}`, 60, 430 + i * 25);
  });

  // Skills
  ctx.fillStyle = '#606080';
  ctx.font = '12px Arial';
  ctx.fillText('Skills: ' + profile.skills.slice(0, 3).join(', '), 60, 530);

  // Create texture and mesh
  const texture = new CanvasTexture(canvas);
  const geometry = new PlaneGeometry(1, 1.25);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide
  });

  return new Mesh(geometry, material);
}

/**
 * Check if BarcodeDetector API is available
 */
export function isBarcodeDetectorSupported(): boolean {
  return 'BarcodeDetector' in window;
}

/**
 * QR Scanner System - IWSDK ECS System
 */
export class QRScannerSystem extends createSystem({}) {
  private scanInterval: number | null = null;
  private profileCard: Mesh | null = null;
  private barcodeDetector: BarcodeDetector | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isDetecting: boolean = false;
  private lastDetectedCode: string = '';
  private detectionCooldown: number = 0;

  init() {
    console.log('QR Scanner System initialized');
    
    // Register scan callback to display profile card
    onScanComplete((profile, matchResult) => {
      this.displayProfileCard(profile, matchResult);
    });

    // Try to initialize real QR detection
    if (isBarcodeDetectorSupported()) {
      this.initBarcodeDetector();
    } else {
      console.log('BarcodeDetector not supported, using demo mode');
      this.startDemoMode();
    }
  }

  async initBarcodeDetector() {
    try {
      this.barcodeDetector = new window.BarcodeDetector!({ formats: ['qr_code'] });
      console.log('BarcodeDetector initialized');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.setAttribute('playsinline', 'true');
      await this.videoElement.play();

      console.log('Camera stream started for QR detection');
      this.isDetecting = true;
    } catch (error) {
      console.error('Failed to initialize BarcodeDetector:', error);
      this.startDemoMode();
    }
  }

  update() {
    // Handle detection cooldown
    if (this.detectionCooldown > 0) {
      this.detectionCooldown--;
      return;
    }

    // Run QR detection if available
    if (this.isDetecting && this.barcodeDetector && this.videoElement) {
      this.detectQRCode();
    }
  }

  async detectQRCode() {
    if (!this.barcodeDetector || !this.videoElement) return;
    if (this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) return;

    try {
      const barcodes = await this.barcodeDetector.detect(this.videoElement);
      
      for (const barcode of barcodes) {
        const rawValue = barcode.rawValue;
        
        // Skip if same code detected recently
        if (rawValue === this.lastDetectedCode) continue;
        
        // Parse QR code
        const participantId = parseQRCode(rawValue);
        if (participantId) {
          console.log('QR Code detected:', rawValue);
          this.lastDetectedCode = rawValue;
          this.detectionCooldown = 180; // ~3 seconds at 60fps
          
          simulateScan(participantId);
          break;
        }
      }
    } catch (error) {
      // Detection errors are common, don't spam console
    }
  }

  startDemoMode() {
    // Demo: cycle through participants
    let demoIndex = 0;
    const demoParticipants = ['p001', 'p002', 'p004', 'p005', 'p006', 'p007', 'p008'];
    
    this.scanInterval = window.setInterval(() => {
      if (demoIndex < demoParticipants.length) {
        simulateScan(demoParticipants[demoIndex]);
        demoIndex++;
      } else {
        demoIndex = 0;
      }
    }, 10000) as unknown as number;
  }

  displayProfileCard(profile: Profile, matchResult: MatchResult) {
    // Remove existing card
    if (this.profileCard) {
      this.world.scene.remove(this.profileCard);
    }

    // Create new profile card
    this.profileCard = createProfileCard(profile, matchResult);
    
    // Position in front of user
    this.profileCard.position.set(0, 1.2, -1.5);
    
    this.world.scene.add(this.profileCard);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (this.profileCard) {
        this.world.scene.remove(this.profileCard);
        this.profileCard = null;
      }
    }, 8000);
  }

  destroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.profileCard) {
      this.world.scene.remove(this.profileCard);
    }
    // Clean up camera stream
    if (this.videoElement) {
      const stream = this.videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      this.videoElement = null;
    }
    this.isDetecting = false;
  }
}
