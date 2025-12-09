/**
 * Hand Tracking Service
 * Handles hand tracking initialization and gesture recognition
 * Uses IWSDK for Meta Quest hand tracking
 */

export interface HandPose {
  isTracked: boolean;
  position: { x: number; y: number; z: number };
  joints: Map<string, { x: number; y: number; z: number }>;
}

export interface HandshakeGestureState {
  leftHandExtended: boolean;
  rightHandExtended: boolean;
  handsClose: boolean;
  gestureProgress: number; // 0-100
  gestureComplete: boolean;
}

let handTrackingActive = false;
let leftHand: any | null = null;
let rightHand: any | null = null;
let gestureCallbacks: ((state: HandshakeGestureState) => void)[] = [];

/**
 * Check if hand tracking is available
 */
export function isHandTrackingAvailable(): boolean {
  return 'XRHand' in window;
}

/**
 * Initialize hand tracking from XR session
 */
export function initializeHandTracking(session: any): boolean {
  if (!session) {
    console.error('No XR session provided for hand tracking');
    return false;
  }

  // Hand tracking is accessed through input sources
  session.addEventListener('inputsourceschange', handleInputSourcesChange);
  
  handTrackingActive = true;
  console.log('Hand tracking initialized');
  
  return true;
}

/**
 * Handle input sources change to detect hands
 */
function handleInputSourcesChange(event: any): void {
  // Check added sources for hands
  for (const inputSource of event.added) {
    if (inputSource.hand) {
      if (inputSource.handedness === 'left') {
        leftHand = inputSource.hand;
        console.log('Left hand detected');
      } else if (inputSource.handedness === 'right') {
        rightHand = inputSource.hand;
        console.log('Right hand detected');
      }
    }
  }

  // Check removed sources
  for (const inputSource of event.removed) {
    if (inputSource.hand) {
      if (inputSource.handedness === 'left') {
        leftHand = null;
      } else if (inputSource.handedness === 'right') {
        rightHand = null;
      }
    }
  }
}

/**
 * Get current hand poses from XR frame
 */
export function getHandPoses(
  frame: any,
  referenceSpace: any
): { left: HandPose | null; right: HandPose | null } {
  const result = { left: null as HandPose | null, right: null as HandPose | null };

  if (leftHand) {
    result.left = extractHandPose(leftHand, frame, referenceSpace);
  }

  if (rightHand) {
    result.right = extractHandPose(rightHand, frame, referenceSpace);
  }

  return result;
}

/**
 * Extract hand pose from XRHand
 */
function extractHandPose(
  hand: any,
  frame: any,
  referenceSpace: any
): HandPose | null {
  const joints = new Map<string, { x: number; y: number; z: number }>();
  let wristPosition = { x: 0, y: 0, z: 0 };
  let isTracked = false;

  // Iterate through hand joints
  for (const [jointName, jointSpace] of hand.entries()) {
    const jointPose = frame.getJointPose?.(jointSpace, referenceSpace);
    
    if (jointPose) {
      isTracked = true;
      const pos = jointPose.transform.position;
      joints.set(jointName as string, { x: pos.x, y: pos.y, z: pos.z });
      
      if (jointName === 'wrist') {
        wristPosition = { x: pos.x, y: pos.y, z: pos.z };
      }
    }
  }

  if (!isTracked) return null;

  return {
    isTracked,
    position: wristPosition,
    joints
  };
}

/**
 * Detect handshake gesture from hand poses
 */
export function detectHandshakeGesture(
  leftPose: HandPose | null,
  rightPose: HandPose | null
): HandshakeGestureState {
  const state: HandshakeGestureState = {
    leftHandExtended: false,
    rightHandExtended: false,
    handsClose: false,
    gestureProgress: 0,
    gestureComplete: false
  };

  if (!leftPose && !rightPose) {
    return state;
  }

  // Check if hands are extended (palm facing forward)
  if (leftPose) {
    state.leftHandExtended = isHandExtended(leftPose);
  }

  if (rightPose) {
    state.rightHandExtended = isHandExtended(rightPose);
  }

  // Check if hands are close together (simulating handshake)
  if (leftPose && rightPose) {
    const distance = calculateHandDistance(leftPose, rightPose);
    state.handsClose = distance < 0.15; // 15cm threshold

    // Calculate gesture progress
    if (state.leftHandExtended && state.rightHandExtended) {
      if (state.handsClose) {
        state.gestureProgress = 100;
        state.gestureComplete = true;
      } else if (distance < 0.5) {
        // Hands approaching
        state.gestureProgress = Math.min(100, Math.round((1 - (distance - 0.15) / 0.35) * 100));
      }
    }
  }

  // Notify callbacks
  gestureCallbacks.forEach(cb => cb(state));

  return state;
}

/**
 * Check if hand is in extended position
 */
function isHandExtended(pose: HandPose): boolean {
  // Check if fingers are relatively straight (extended)
  const indexTip = pose.joints.get('index-finger-tip');
  const indexMcp = pose.joints.get('index-finger-metacarpal');
  const wrist = pose.joints.get('wrist');

  if (!indexTip || !indexMcp || !wrist) return false;

  // Calculate if index finger is extended forward
  const fingerLength = Math.sqrt(
    Math.pow(indexTip.x - indexMcp.x, 2) +
    Math.pow(indexTip.y - indexMcp.y, 2) +
    Math.pow(indexTip.z - indexMcp.z, 2)
  );

  // Extended if finger is reasonably straight
  return fingerLength > 0.06; // 6cm threshold
}

/**
 * Calculate distance between two hand positions
 */
function calculateHandDistance(left: HandPose, right: HandPose): number {
  return Math.sqrt(
    Math.pow(left.position.x - right.position.x, 2) +
    Math.pow(left.position.y - right.position.y, 2) +
    Math.pow(left.position.z - right.position.z, 2)
  );
}

/**
 * Register callback for gesture detection
 */
export function onHandshakeGesture(callback: (state: HandshakeGestureState) => void): () => void {
  gestureCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    gestureCallbacks = gestureCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Stop hand tracking
 */
export function stopHandTracking(): void {
  handTrackingActive = false;
  leftHand = null;
  rightHand = null;
  gestureCallbacks = [];
}

/**
 * Check if hand tracking is currently active
 */
export function isHandTrackingActive(): boolean {
  return handTrackingActive;
}

/**
 * Get hand tracking status
 */
export function getHandTrackingStatus(): {
  active: boolean;
  leftHandTracked: boolean;
  rightHandTracked: boolean;
} {
  return {
    active: handTrackingActive,
    leftHandTracked: leftHand !== null,
    rightHandTracked: rightHand !== null
  };
}
