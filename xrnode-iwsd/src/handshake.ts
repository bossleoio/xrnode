/**
 * Handshake Gesture System for IWSDK
 * Detects handshake gestures for connection confirmation
 */

import {
  createSystem,
  Vector3,
} from "@iwsdk/core";

import { Profile, MatchResult, Connection } from './services/types.js';

export interface HandshakeState {
  leftHandPosition: Vector3 | null;
  rightHandPosition: Vector3 | null;
  handsClose: boolean;
  gestureProgress: number;
  gestureComplete: boolean;
}

let handshakeState: HandshakeState = {
  leftHandPosition: null,
  rightHandPosition: null,
  handsClose: false,
  gestureProgress: 0,
  gestureComplete: false
};

// Pending connection to confirm
let pendingProfile: Profile | null = null;
let pendingMatchResult: MatchResult | null = null;

// Confirmed connections
const connections: Connection[] = [];

// Callbacks
type ConnectionCallback = (connection: Connection) => void;
const connectionCallbacks: ConnectionCallback[] = [];

/**
 * Register callback for confirmed connections
 */
export function onConnectionConfirmed(callback: ConnectionCallback): void {
  connectionCallbacks.push(callback);
}

/**
 * Get all confirmed connections
 */
export function getConnections(): Connection[] {
  return [...connections];
}

/**
 * Set pending connection for handshake confirmation
 */
export function setPendingConnection(profile: Profile, matchResult: MatchResult): void {
  pendingProfile = profile;
  pendingMatchResult = matchResult;
  handshakeState.gestureProgress = 0;
  handshakeState.gestureComplete = false;
  console.log(`Awaiting handshake to confirm connection with ${profile.name}`);
}

/**
 * Confirm connection (called when handshake gesture is detected)
 */
export function confirmConnection(): Connection | null {
  if (!pendingProfile || !pendingMatchResult) {
    console.warn('No pending connection to confirm');
    return null;
  }

  const connection: Connection = {
    id: `conn_${Date.now()}`,
    profile: pendingProfile,
    matchScore: pendingMatchResult.score,
    connectedAt: new Date(),
    appreciationCount: 0
  };

  connections.push(connection);
  
  // Notify callbacks
  connectionCallbacks.forEach(cb => cb(connection));

  console.log(`Connection confirmed with ${pendingProfile.name}!`);

  // Clear pending
  pendingProfile = null;
  pendingMatchResult = null;
  handshakeState.gestureComplete = true;

  // Save to localStorage
  saveConnections();

  return connection;
}

/**
 * Save connections to localStorage
 */
function saveConnections(): void {
  try {
    localStorage.setItem('xrnode_connections', JSON.stringify(connections));
  } catch (e) {
    console.error('Failed to save connections:', e);
  }
}

/**
 * Load connections from localStorage
 */
export function loadConnections(): void {
  try {
    const saved = localStorage.getItem('xrnode_connections');
    if (saved) {
      const parsed = JSON.parse(saved);
      connections.length = 0;
      connections.push(...parsed);
      console.log(`Loaded ${connections.length} connections`);
    }
  } catch (e) {
    console.error('Failed to load connections:', e);
  }
}

/**
 * Get handshake state
 */
export function getHandshakeState(): HandshakeState {
  return { ...handshakeState };
}

/**
 * Handshake System - IWSDK ECS System
 */
export class HandshakeSystem extends createSystem({}) {
  private readonly HAND_PROXIMITY_THRESHOLD = 0.15; // 15cm
  private readonly GESTURE_HOLD_TIME = 1500; // 1.5 seconds
  private gestureStartTime: number | null = null;

  init() {
    console.log('Handshake System initialized');
    loadConnections();
  }

  update() {
    // Get hand positions from XR input sources
    const session = this.world.renderer.xr.getSession();
    if (!session) return;

    const inputSources = session.inputSources;
    let leftHand: Vector3 | null = null;
    let rightHand: Vector3 | null = null;

    for (const source of inputSources) {
      if (source.hand) {
        // Get wrist position for hand tracking
        const wrist = source.hand.get('wrist');
        if (wrist) {
          const frame = this.world.renderer.xr.getFrame();
          const refSpace = this.world.renderer.xr.getReferenceSpace();
          if (frame && refSpace) {
            const pose = frame.getJointPose?.(wrist, refSpace);
            if (pose) {
              const pos = new Vector3(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
              );
              if (source.handedness === 'left') {
                leftHand = pos;
              } else {
                rightHand = pos;
              }
            }
          }
        }
      }
    }

    handshakeState.leftHandPosition = leftHand;
    handshakeState.rightHandPosition = rightHand;

    // Check if hands are close together (handshake gesture)
    if (leftHand && rightHand) {
      const distance = leftHand.distanceTo(rightHand);
      handshakeState.handsClose = distance < this.HAND_PROXIMITY_THRESHOLD;

      if (handshakeState.handsClose && pendingProfile) {
        if (!this.gestureStartTime) {
          this.gestureStartTime = Date.now();
        }

        const elapsed = Date.now() - this.gestureStartTime;
        handshakeState.gestureProgress = Math.min(100, (elapsed / this.GESTURE_HOLD_TIME) * 100);

        if (elapsed >= this.GESTURE_HOLD_TIME && !handshakeState.gestureComplete) {
          confirmConnection();
          this.gestureStartTime = null;
        }
      } else {
        this.gestureStartTime = null;
        if (!handshakeState.gestureComplete) {
          handshakeState.gestureProgress = 0;
        }
      }
    } else {
      handshakeState.handsClose = false;
      this.gestureStartTime = null;
    }
  }
}
