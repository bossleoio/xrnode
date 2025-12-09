/**
 * WebXR Service
 * Handles WebXR initialization, device detection, and session management
 * Configured for Meta Quest devices as primary target
 * Uses Meta IWSDK for enhanced WebXR capabilities
 */

// IWSDK types - will be available after npm install
// import { World, System } from '@iwsdk/core';

export interface WebXRCapabilities {
  isSupported: boolean;
  isImmersiveARSupported: boolean;
  isImmersiveVRSupported: boolean;
  isInlineSupported: boolean;
  isMetaQuest: boolean;
  hasHandTracking: boolean;
  hasPassThrough: boolean;
}

export interface XRSessionState {
  isActive: boolean;
  mode: string | null;
  session: any | null;
  referenceSpace: any | null;
}

let currentSession: any | null = null;
let referenceSpace: any | null = null;
let iwsdkWorld: any | null = null;

/**
 * Check if WebXR is supported in the current browser
 */
export async function checkWebXRSupport(): Promise<WebXRCapabilities> {
  const capabilities: WebXRCapabilities = {
    isSupported: false,
    isImmersiveARSupported: false,
    isImmersiveVRSupported: false,
    isInlineSupported: false,
    isMetaQuest: false,
    hasHandTracking: false,
    hasPassThrough: false
  };

  // Check if WebXR API exists
  if (!('xr' in navigator)) {
    console.log('WebXR not supported in this browser');
    return capabilities;
  }

  capabilities.isSupported = true;

  try {
    // Check for immersive-ar support (pass-through AR)
    capabilities.isImmersiveARSupported = await (navigator as any).xr!.isSessionSupported('immersive-ar');
  } catch (e) {
    console.log('immersive-ar not supported');
  }

  try {
    // Check for immersive-vr support
    capabilities.isImmersiveVRSupported = await (navigator as any).xr!.isSessionSupported('immersive-vr');
  } catch (e) {
    console.log('immersive-vr not supported');
  }

  try {
    // Check for inline support
    capabilities.isInlineSupported = await (navigator as any).xr!.isSessionSupported('inline');
  } catch (e) {
    console.log('inline not supported');
  }

  // Detect Meta Quest device
  capabilities.isMetaQuest = detectMetaQuest();

  // Check for hand tracking support
  capabilities.hasHandTracking = checkHandTrackingSupport();

  // Pass-through is available if immersive-ar is supported on Quest
  capabilities.hasPassThrough = capabilities.isImmersiveARSupported && capabilities.isMetaQuest;

  return capabilities;
}

/**
 * Detect if running on Meta Quest device
 */
export function detectMetaQuest(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Quest-specific user agent strings
  const isQuest = userAgent.includes('quest') || 
                  userAgent.includes('oculus') ||
                  userAgent.includes('meta');
  
  // Additional check for OculusBrowser
  const isOculusBrowser = userAgent.includes('oculusbrowser');
  
  return isQuest || isOculusBrowser;
}

/**
 * Check if hand tracking is supported
 */
function checkHandTrackingSupport(): boolean {
  // Hand tracking support detection
  // This will be validated when session is created
  return 'XRHand' in window;
}

/**
 * Request an immersive AR session for pass-through experience
 */
export async function requestImmersiveARSession(
  onSessionStart?: (session: any) => void,
  onSessionEnd?: () => void
): Promise<any | null> {
  if (!(navigator as any).xr) {
    console.error('WebXR not available');
    return null;
  }

  try {
    // Request immersive-ar session with required features
    const sessionInit: any = {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hand-tracking', 'dom-overlay', 'camera-access']
    };

    const session = await (navigator as any).xr.requestSession('immersive-ar', sessionInit);
    
    currentSession = session;

    // Set up session end handler
    session.addEventListener('end', () => {
      currentSession = null;
      referenceSpace = null;
      onSessionEnd?.();
    });

    // Get reference space
    referenceSpace = await session.requestReferenceSpace('local-floor');

    onSessionStart?.(session);
    
    return session;
  } catch (error) {
    console.error('Failed to start immersive-ar session:', error);
    return null;
  }
}

/**
 * Request an immersive VR session
 */
export async function requestImmersiveVRSession(
  onSessionStart?: (session: any) => void,
  onSessionEnd?: () => void
): Promise<any | null> {
  if (!(navigator as any).xr) {
    console.error('WebXR not available');
    return null;
  }

  try {
    const sessionInit: any = {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hand-tracking', 'dom-overlay']
    };

    const session = await (navigator as any).xr.requestSession('immersive-vr', sessionInit);
    
    currentSession = session;

    session.addEventListener('end', () => {
      currentSession = null;
      referenceSpace = null;
      onSessionEnd?.();
    });

    referenceSpace = await session.requestReferenceSpace('local-floor');

    onSessionStart?.(session);
    
    return session;
  } catch (error) {
    console.error('Failed to start immersive-vr session:', error);
    return null;
  }
}

/**
 * End the current XR session
 */
export async function endXRSession(): Promise<void> {
  if (currentSession) {
    await currentSession.end();
    currentSession = null;
    referenceSpace = null;
  }
}

/**
 * Get current XR session state
 */
export function getXRSessionState(): XRSessionState {
  return {
    isActive: currentSession !== null,
    mode: currentSession?.mode ?? null,
    session: currentSession,
    referenceSpace
  };
}

/**
 * Check if currently in an XR session
 */
export function isInXRSession(): boolean {
  return currentSession !== null;
}

/**
 * Get the current XR session
 */
export function getCurrentSession(): any | null {
  return currentSession;
}

/**
 * Get the current reference space
 */
export function getReferenceSpace(): any | null {
  return referenceSpace;
}

/**
 * Initialize WebXR with fallback for non-WebXR browsers
 */
export async function initializeWebXR(): Promise<{
  capabilities: WebXRCapabilities;
  fallbackMode: boolean;
}> {
  const capabilities = await checkWebXRSupport();
  
  // Determine if we need fallback mode
  const fallbackMode = !capabilities.isSupported || 
                       (!capabilities.isImmersiveARSupported && !capabilities.isImmersiveVRSupported);

  if (fallbackMode) {
    console.log('WebXR not fully supported. Running in fallback/demo mode.');
  } else {
    console.log('WebXR supported. Capabilities:', capabilities);
  }

  return {
    capabilities,
    fallbackMode
  };
}

/**
 * Request DOM overlay for UI rendering in XR
 */
export function getDOMOverlayInit(overlayElement: HTMLElement): any {
  return {
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['hand-tracking', 'dom-overlay'],
    domOverlay: { root: overlayElement }
  };
}
