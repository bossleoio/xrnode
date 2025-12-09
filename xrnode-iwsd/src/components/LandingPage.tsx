import React from 'react';
import { APP_NAME, EVENT_NAME } from '../constants';
import { getConnectionCount } from '../services/connectionService';
import { useWebXR } from '../contexts/WebXRContext';

interface LandingPageProps {
  onStartScan: () => void;
  onOpenDirectory: () => void;
  onOpenNetwork: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartScan, 
  onOpenDirectory, 
  onOpenNetwork 
}) => {
  const connectionCount = getConnectionCount();
  const { isMetaQuest, isSupported, capabilities, startXRSession, isXRActive, isLoading } = useWebXR();

  const handleEnterXR = async () => {
    const success = await startXRSession();
    if (success) {
      onStartScan();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-xr-dark to-xr-panel">
      {/* Logo and Title */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-xr-accent to-xr-secondary flex items-center justify-center">
          <i className="fas fa-vr-cardboard text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">{APP_NAME}</h1>
        <p className="text-xr-dim text-lg">{EVENT_NAME}</p>
        
        {/* WebXR Status Indicator */}
        {isMetaQuest && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isXRActive ? 'bg-green-500' : 'bg-xr-accent'} animate-pulse`}></div>
            <span className="text-xr-accent text-sm">
              {isXRActive ? 'XR Session Active' : 'Meta Quest Detected'}
            </span>
          </div>
        )}
      </div>

      {/* Enter XR Button (for Quest) */}
      {isMetaQuest && capabilities?.isImmersiveARSupported && !isXRActive && (
        <button
          onClick={handleEnterXR}
          disabled={isLoading}
          className="w-full max-w-xs mb-4 py-4 px-8 bg-gradient-to-r from-xr-secondary to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-xr-secondary/30 hover:shadow-xr-secondary/50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Starting XR...
            </>
          ) : (
            <>
              <i className="fas fa-vr-cardboard text-xl"></i>
              Enter Mixed Reality
            </>
          )}
        </button>
      )}

      {/* Main Action Button */}
      <button
        onClick={onStartScan}
        className="w-full max-w-xs mb-4 py-4 px-8 bg-gradient-to-r from-xr-accent to-cyan-400 text-black font-bold text-lg rounded-xl shadow-lg shadow-xr-accent/30 hover:shadow-xr-accent/50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
      >
        <i className="fas fa-qrcode text-xl"></i>
        Scan QR Code
      </button>

      {/* Secondary Actions */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={onOpenDirectory}
          className="w-full py-3 px-6 bg-xr-panel border border-xr-dim/30 text-white font-medium rounded-xl hover:border-xr-accent/50 hover:bg-xr-panel/80 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <i className="fas fa-users text-xr-accent"></i>
          View All Participants
        </button>

        <button
          onClick={onOpenNetwork}
          className="w-full py-3 px-6 bg-xr-panel border border-xr-dim/30 text-white font-medium rounded-xl hover:border-xr-accent/50 hover:bg-xr-panel/80 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <i className="fas fa-network-wired text-xr-secondary"></i>
          My Network
          {connectionCount > 0 && (
            <span className="ml-auto bg-xr-secondary text-white text-sm px-2 py-0.5 rounded-full">
              {connectionCount}
            </span>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center max-w-sm">
        <p className="text-xr-dim text-sm">
          Scan a participant's QR code to view their profile and discover your match compatibility
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-xr-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-xr-secondary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default LandingPage;
