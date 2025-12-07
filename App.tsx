import React, { useState } from 'react';
import { AppState, Profile } from './types';
import { MOCK_PROFILES } from './constants';
import LandingPage from './components/LandingPage';
import Scanner from './components/Scanner';
import ProfileCard from './components/ProfileCard';
import MatchOverlay from './components/MatchOverlay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const startScan = () => {
    setAppState(AppState.SCANNING);
  };

  const handleScanComplete = () => {
    // Select a random profile to simulate a unique QR scan result
    const randomProfile = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
    setCurrentProfile(randomProfile);
    setAppState(AppState.PROFILE_VIEW);
  };

  const handleCancelScan = () => {
    setAppState(AppState.LANDING);
  };

  const handleLike = () => {
    setAppState(AppState.MATCHED);
  };

  const handlePass = () => {
    setCurrentProfile(null);
    setAppState(AppState.SCANNING); // Go back to scan another
  };

  const closeMatch = () => {
    setCurrentProfile(null);
    setAppState(AppState.LANDING);
  };

  const closeProfile = () => {
      setCurrentProfile(null);
      setAppState(AppState.LANDING);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-xr-accent selection:text-black">
      {appState === AppState.LANDING && (
        <LandingPage onStart={startScan} />
      )}

      {appState === AppState.SCANNING && (
        <Scanner 
          onScanComplete={handleScanComplete} 
          onCancel={handleCancelScan} 
        />
      )}

      {appState === AppState.PROFILE_VIEW && currentProfile && (
        <ProfileCard 
          profile={currentProfile}
          onLike={handleLike}
          onPass={handlePass}
          onClose={closeProfile}
        />
      )}

      {appState === AppState.MATCHED && currentProfile && (
        <MatchOverlay 
          profile={currentProfile}
          onClose={closeMatch}
        />
      )}
      
      {/* Global decorative footer for visual consistency if needed, typically minimal in this kind of app */}
    </div>
  );
};

export default App;
