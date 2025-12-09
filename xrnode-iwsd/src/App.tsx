import React, { useState, useCallback } from 'react';
import { AppState, Profile, MatchResult, ScanResult, Connection } from './types';
import { PARTICIPANT_DATABASE } from './constants';
import { 
  LandingPage, 
  Scanner, 
  ProfileCard, 
  HandshakeConfirm,
  Directory,
  Network,
  Navigation
} from './components';
import { getProfileById } from './services/profileService';
import { analyzeMatch, getMatchLevel } from './services/matchingService';
import { saveConnection, sendAppreciation } from './services/connectionService';

const App: React.FC = () => {
  // App state
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Current user profile (for demo, use first participant)
  const [currentUser] = useState<Profile>(PARTICIPANT_DATABASE[2]); // Marlaina

  // Navigation handler
  const handleNavigate = useCallback((state: AppState) => {
    setError(null);
    if (state === AppState.SCANNING) {
      setCurrentProfile(null);
      setMatchResult(null);
    }
    setAppState(state);
  }, []);

  // QR Scan handlers
  const handleScanComplete = useCallback(async (result: ScanResult) => {
    setIsLoading(true);
    try {
      // Fetch profile from database
      const profile = await getProfileById(result.participantId);
      
      if (!profile) {
        setError('Participant not found. Please try scanning again.');
        setAppState(AppState.ERROR);
        return;
      }

      // Check if scanning self
      if (profile.id === currentUser.id) {
        setError('You cannot scan your own QR code!');
        setAppState(AppState.ERROR);
        return;
      }

      // Analyze match
      const match = await analyzeMatch(currentUser, profile);
      
      setCurrentProfile(profile);
      setMatchResult(match);
      setAppState(AppState.PROFILE_VIEW);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      setAppState(AppState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleCancelScan = useCallback(() => {
    setAppState(AppState.LANDING);
  }, []);

  const handleScanError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setAppState(AppState.ERROR);
  }, []);

  // Profile view handlers
  const handleConnect = useCallback(() => {
    if (currentProfile && matchResult) {
      setAppState(AppState.HANDSHAKE);
    }
  }, [currentProfile, matchResult]);

  const handlePass = useCallback(() => {
    setCurrentProfile(null);
    setMatchResult(null);
    setAppState(AppState.SCANNING);
  }, []);

  const closeProfile = useCallback(() => {
    setCurrentProfile(null);
    setMatchResult(null);
    setAppState(AppState.LANDING);
  }, []);

  // Handshake handlers
  const handleHandshakeConfirm = useCallback(() => {
    if (currentProfile && matchResult) {
      // Save connection
      saveConnection(currentProfile, matchResult.score);
      
      // Show success and return to landing
      setCurrentProfile(null);
      setMatchResult(null);
      setAppState(AppState.NETWORK);
    }
  }, [currentProfile, matchResult]);

  const handleHandshakeCancel = useCallback(() => {
    setAppState(AppState.PROFILE_VIEW);
  }, []);

  // Directory handlers
  const handleSelectFromDirectory = useCallback((profile: Profile, match: MatchResult) => {
    setCurrentProfile(profile);
    setMatchResult(match);
    setAppState(AppState.PROFILE_VIEW);
  }, []);

  // Network handlers
  const handleSelectConnection = useCallback((connection: Connection) => {
    const match: MatchResult = {
      score: connection.matchScore,
      matchLevel: getMatchLevel(connection.matchScore),
      reasons: []
    };
    setCurrentProfile(connection.profile);
    setMatchResult(match);
    setAppState(AppState.PROFILE_VIEW);
  }, []);

  // Appreciation handler
  const handleSendAppreciation = useCallback(() => {
    if (currentProfile) {
      sendAppreciation(currentProfile.id);
      // Could show a toast notification here
    }
  }, [currentProfile]);

  // Error recovery
  const handleErrorRecovery = useCallback(() => {
    setError(null);
    setAppState(AppState.LANDING);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-xr-accent selection:text-black pb-16">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-xr-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      )}

      {/* Landing Page */}
      {appState === AppState.LANDING && (
        <LandingPage 
          onStartScan={() => handleNavigate(AppState.SCANNING)}
          onOpenDirectory={() => handleNavigate(AppState.DIRECTORY)}
          onOpenNetwork={() => handleNavigate(AppState.NETWORK)}
        />
      )}

      {/* Scanner */}
      {appState === AppState.SCANNING && (
        <Scanner 
          onScanComplete={handleScanComplete}
          onCancel={handleCancelScan}
          onError={handleScanError}
        />
      )}

      {/* Profile View */}
      {appState === AppState.PROFILE_VIEW && currentProfile && matchResult && (
        <ProfileCard 
          profile={currentProfile}
          matchResult={matchResult}
          onConnect={handleConnect}
          onPass={handlePass}
          onClose={closeProfile}
          onSendAppreciation={handleSendAppreciation}
        />
      )}

      {/* Handshake Confirmation */}
      {appState === AppState.HANDSHAKE && currentProfile && matchResult && (
        <HandshakeConfirm
          profile={currentProfile}
          matchResult={matchResult}
          onConfirm={handleHandshakeConfirm}
          onCancel={handleHandshakeCancel}
        />
      )}

      {/* Directory View */}
      {appState === AppState.DIRECTORY && (
        <Directory
          currentUser={currentUser}
          onSelectProfile={handleSelectFromDirectory}
          onClose={() => handleNavigate(AppState.LANDING)}
        />
      )}

      {/* Network View */}
      {appState === AppState.NETWORK && (
        <Network
          onSelectConnection={handleSelectConnection}
          onClose={() => handleNavigate(AppState.LANDING)}
        />
      )}

      {/* Error State */}
      {appState === AppState.ERROR && (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-xr-dim mb-6">{error || 'An unexpected error occurred'}</p>
            <button
              onClick={handleErrorRecovery}
              className="px-8 py-3 bg-xr-accent text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <Navigation 
        currentState={appState}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
