import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  WebXRCapabilities, 
  checkWebXRSupport, 
  initializeWebXR,
  requestImmersiveARSession,
  endXRSession,
  isInXRSession,
  detectMetaQuest
} from '../services/webxrService';
import {
  initializeHandTracking,
  stopHandTracking,
  isHandTrackingAvailable,
  onHandshakeGesture,
  HandshakeGestureState
} from '../services/handTrackingService';

interface WebXRContextType {
  // Capabilities
  capabilities: WebXRCapabilities | null;
  isSupported: boolean;
  isMetaQuest: boolean;
  fallbackMode: boolean;
  
  // Session state
  isXRActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Hand tracking
  handTrackingAvailable: boolean;
  handshakeState: HandshakeGestureState | null;
  
  // Actions
  startXRSession: () => Promise<boolean>;
  stopXRSession: () => Promise<void>;
  checkCapabilities: () => Promise<void>;
}

const defaultContext: WebXRContextType = {
  capabilities: null,
  isSupported: false,
  isMetaQuest: false,
  fallbackMode: true,
  isXRActive: false,
  isLoading: false,
  error: null,
  handTrackingAvailable: false,
  handshakeState: null,
  startXRSession: async () => false,
  stopXRSession: async () => {},
  checkCapabilities: async () => {}
};

const WebXRContext = createContext<WebXRContextType>(defaultContext);

export function useWebXR(): WebXRContextType {
  return useContext(WebXRContext);
}

interface WebXRProviderProps {
  children: ReactNode;
}

export function WebXRProvider({ children }: WebXRProviderProps): React.ReactElement {
  const [capabilities, setCapabilities] = useState<WebXRCapabilities | null>(null);
  const [fallbackMode, setFallbackMode] = useState(true);
  const [isXRActive, setIsXRActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handshakeState, setHandshakeState] = useState<HandshakeGestureState | null>(null);

  // Check WebXR capabilities on mount
  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = useCallback(async () => {
    try {
      const result = await initializeWebXR();
      setCapabilities(result.capabilities);
      setFallbackMode(result.fallbackMode);
      
      console.log('WebXR Capabilities:', result.capabilities);
      console.log('Fallback Mode:', result.fallbackMode);
    } catch (err) {
      console.error('Failed to check WebXR capabilities:', err);
      setFallbackMode(true);
    }
  }, []);

  const startXRSession = useCallback(async (): Promise<boolean> => {
    if (!capabilities?.isImmersiveARSupported) {
      setError('Immersive AR not supported on this device');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await requestImmersiveARSession(
        (session) => {
          console.log('XR Session started');
          setIsXRActive(true);
          
          // Initialize hand tracking if available
          if (isHandTrackingAvailable()) {
            initializeHandTracking(session);
            
            // Subscribe to handshake gestures
            onHandshakeGesture((state) => {
              setHandshakeState(state);
            });
          }
        },
        () => {
          console.log('XR Session ended');
          setIsXRActive(false);
          stopHandTracking();
          setHandshakeState(null);
        }
      );

      if (!session) {
        setError('Failed to start XR session');
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start XR session';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [capabilities]);

  const stopXRSession = useCallback(async () => {
    try {
      await endXRSession();
      setIsXRActive(false);
      stopHandTracking();
      setHandshakeState(null);
    } catch (err) {
      console.error('Error stopping XR session:', err);
    }
  }, []);

  const value: WebXRContextType = {
    capabilities,
    isSupported: capabilities?.isSupported ?? false,
    isMetaQuest: capabilities?.isMetaQuest ?? detectMetaQuest(),
    fallbackMode,
    isXRActive,
    isLoading,
    error,
    handTrackingAvailable: isHandTrackingAvailable(),
    handshakeState,
    startXRSession,
    stopXRSession,
    checkCapabilities
  };

  return (
    <WebXRContext.Provider value={value}>
      {children}
    </WebXRContext.Provider>
  );
}

export default WebXRContext;
