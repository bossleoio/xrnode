import React from 'react';
import { AppState } from '../types';
import { getConnectionCount } from '../services/connectionService';

interface NavigationProps {
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentState, onNavigate }) => {
  const connectionCount = getConnectionCount();

  // Don't show navigation during scanning or handshake
  if (currentState === AppState.SCANNING || currentState === AppState.HANDSHAKE) {
    return null;
  }

  const navItems = [
    { state: AppState.LANDING, icon: 'fa-home', label: 'Home' },
    { state: AppState.SCANNING, icon: 'fa-qrcode', label: 'Scan' },
    { state: AppState.DIRECTORY, icon: 'fa-users', label: 'Directory' },
    { state: AppState.NETWORK, icon: 'fa-network-wired', label: 'Network', badge: connectionCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-xr-panel/95 backdrop-blur-sm border-t border-xr-dim/20 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = currentState === item.state || 
            (item.state === AppState.LANDING && currentState === AppState.PROFILE_VIEW);
          
          return (
            <button
              key={item.state}
              onClick={() => onNavigate(item.state)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
                isActive ? 'text-xr-accent' : 'text-xr-dim hover:text-white'
              }`}
            >
              <div className="relative">
                <i className={`fas ${item.icon} text-xl`}></i>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-xr-secondary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-xr-accent rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
