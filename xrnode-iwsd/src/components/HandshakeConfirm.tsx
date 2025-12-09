import React, { useState, useEffect } from 'react';
import { Profile, MatchResult } from '../types';
import { getAuraColor } from '../services/matchingService';
import { useWebXR } from '../contexts/WebXRContext';

interface HandshakeConfirmProps {
  profile: Profile;
  matchResult: MatchResult;
  onConfirm: () => void;
  onCancel: () => void;
}

const HandshakeConfirm: React.FC<HandshakeConfirmProps> = ({
  profile,
  matchResult,
  onConfirm,
  onCancel
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [handshakeProgress, setHandshakeProgress] = useState(0);
  const auraColor = getAuraColor(matchResult.matchLevel);
  
  // Get WebXR context for hand tracking
  const { isXRActive, handTrackingAvailable, handshakeState, isMetaQuest } = useWebXR();

  // Handle handshake gesture from WebXR hand tracking
  useEffect(() => {
    if (isXRActive && handTrackingAvailable && handshakeState) {
      // Update progress based on hand tracking gesture
      setHandshakeProgress(handshakeState.gestureProgress);
      
      if (handshakeState.gestureComplete && !isAnimating) {
        setIsAnimating(true);
        setTimeout(() => {
          onConfirm();
        }, 300);
      }
    }
  }, [handshakeState, isXRActive, handTrackingAvailable, isAnimating, onConfirm]);

  // Fallback: Manual handshake gesture simulation
  const handleHandshakeGesture = () => {
    setIsAnimating(true);
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setHandshakeProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onConfirm();
        }, 300);
      }
    }, 100);
  };

  // Keyboard shortcut for demo
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleHandshakeGesture();
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
      {/* Animated background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${auraColor} 0%, transparent 50%)`
        }}
      />

      <div className="relative text-center max-w-md">
        {/* Profile avatars coming together */}
        <div className="relative h-40 mb-8">
          {/* Your avatar */}
          <div 
            className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${
              isAnimating ? '-translate-x-8' : '-translate-x-24'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-xr-accent to-cyan-400 flex items-center justify-center shadow-lg shadow-xr-accent/30">
              <i className="fas fa-user text-2xl text-white"></i>
            </div>
          </div>

          {/* Their avatar */}
          <div 
            className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${
              isAnimating ? 'translate-x-8' : 'translate-x-24'
            }`}
          >
            <div 
              className="w-20 h-20 rounded-full overflow-hidden shadow-lg"
              style={{ boxShadow: `0 0 20px ${auraColor}50` }}
            >
              <img 
                src={profile.imageUrl} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Handshake icon */}
          <div 
            className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              isAnimating ? 'scale-125 opacity-100' : 'scale-75 opacity-50'
            }`}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: isAnimating ? auraColor : 'transparent',
                border: `3px solid ${auraColor}`
              }}
            >
              <i className={`fas fa-handshake text-2xl ${isAnimating ? 'text-white' : 'text-xr-dim'}`}></i>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isAnimating && (
          <div className="mb-6">
            <div className="h-2 bg-xr-panel rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-100"
                style={{ 
                  width: `${handshakeProgress}%`,
                  backgroundColor: auraColor
                }}
              />
            </div>
            <p className="text-xr-dim text-sm mt-2">Confirming connection...</p>
          </div>
        )}

        {/* Instructions */}
        {!isAnimating && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect with {profile.name}?
            </h2>
            <p className="text-xr-dim mb-8">
              Perform a handshake gesture to confirm this connection
            </p>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onCancel}
                className="px-8 py-3 bg-xr-panel border border-xr-dim/30 text-xr-dim font-medium rounded-xl hover:border-red-500/50 hover:text-red-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleHandshakeGesture}
                className="px-8 py-3 text-black font-bold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: auraColor }}
              >
                <i className="fas fa-handshake"></i>
                Confirm Handshake
              </button>
            </div>

            {/* Gesture hint */}
            <div className="mt-8 p-4 bg-xr-panel/50 rounded-xl">
              {isXRActive && handTrackingAvailable ? (
                <>
                  <p className="text-xr-accent text-sm">
                    <i className="fas fa-hand-paper mr-2"></i>
                    Hand tracking active - Extend your hand forward
                  </p>
                  <p className="text-xr-dim text-xs mt-1">
                    Bring both hands together to complete handshake
                  </p>
                </>
              ) : isMetaQuest ? (
                <>
                  <p className="text-xr-dim text-sm">
                    <i className="fas fa-vr-cardboard mr-2"></i>
                    Meta Quest detected - Hand tracking available in XR mode
                  </p>
                  <p className="text-xr-dim text-xs mt-1">
                    Tap button above or use controller to confirm
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xr-dim text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    In VR: Extend your hand forward to initiate handshake
                  </p>
                  <p className="text-xr-dim text-xs mt-1">
                    Demo: Press Enter or click the button above
                  </p>
                </>
              )}
            </div>
          </>
        )}

        {/* Success state */}
        {handshakeProgress >= 100 && (
          <div className="animate-pulse">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: auraColor }}
            >
              <i className="fas fa-check text-4xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-white">Connected!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandshakeConfirm;
