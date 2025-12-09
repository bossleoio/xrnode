import React, { useState, useEffect } from 'react';
import { Connection, MatchResult } from '../types';
import { 
  getConnectionsSortedByScore, 
  getConnectionsSortedByDate,
  sendAppreciation,
  getConnectionCount
} from '../services/connectionService';
import { getAuraColor, getMatchLevel } from '../services/matchingService';

interface NetworkProps {
  onSelectConnection: (connection: Connection) => void;
  onClose: () => void;
}

type SortType = 'score' | 'date';

const Network: React.FC<NetworkProps> = ({ onSelectConnection, onClose }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sort, setSort] = useState<SortType>('date');

  useEffect(() => {
    loadConnections();
  }, [sort]);

  const loadConnections = () => {
    const sorted = sort === 'score' 
      ? getConnectionsSortedByScore() 
      : getConnectionsSortedByDate();
    setConnections(sorted);
  };

  const handleSendStar = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    sendAppreciation(profileId);
    loadConnections();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-xr-dark flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-xr-dark/95 backdrop-blur-sm border-b border-xr-dim/20">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 text-xr-dim hover:text-white transition-colors"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-bold text-white">My Network</h1>
          <div className="w-8"></div>
        </div>

        {/* Sort Toggle */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <button
            onClick={() => setSort('date')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sort === 'date' 
                ? 'bg-xr-accent text-black' 
                : 'bg-xr-panel text-xr-dim hover:text-white'
            }`}
          >
            <i className="fas fa-clock mr-2"></i>
            Recent
          </button>
          <button
            onClick={() => setSort('score')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sort === 'score' 
                ? 'bg-xr-accent text-black' 
                : 'bg-xr-panel text-xr-dim hover:text-white'
            }`}
          >
            <i className="fas fa-bolt mr-2"></i>
            Best Match
          </button>
        </div>
      </div>

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto p-4">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-full bg-xr-panel flex items-center justify-center mb-4">
              <i className="fas fa-network-wired text-3xl text-xr-dim"></i>
            </div>
            <h3 className="text-white font-medium mb-2">No Connections Yet</h3>
            <p className="text-xr-dim text-sm max-w-xs">
              Scan QR codes and confirm handshakes to build your network
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map(connection => {
              const matchLevel = getMatchLevel(connection.matchScore);
              const auraColor = getAuraColor(matchLevel);
              
              return (
                <button
                  key={connection.id}
                  onClick={() => onSelectConnection(connection)}
                  className="w-full bg-xr-panel rounded-xl p-4 flex items-center gap-4 hover:bg-xr-panel/80 transition-colors text-left"
                  style={{ borderLeft: `4px solid ${auraColor}` }}
                >
                  {/* Avatar */}
                  <div 
                    className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                    style={{ boxShadow: `0 0 15px ${auraColor}30` }}
                  >
                    <img 
                      src={connection.profile.imageUrl} 
                      alt={connection.profile.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Connected indicator */}
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-xr-panel"
                      style={{ backgroundColor: auraColor }}
                    ></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{connection.profile.name}</h3>
                    <p className="text-xr-accent text-sm truncate">{connection.profile.role}</p>
                    <p className="text-xr-dim text-xs">
                      Connected {formatDate(connection.connectedAt)}
                    </p>
                  </div>

                  {/* Match Score & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Appreciation count */}
                    {connection.appreciationCount > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <i className="fas fa-star text-sm"></i>
                        <span className="text-sm">{connection.appreciationCount}</span>
                      </div>
                    )}

                    {/* Send star button */}
                    <button
                      onClick={(e) => handleSendStar(e, connection.profile.id)}
                      className="p-2 text-xr-dim hover:text-yellow-400 transition-colors"
                      title="Send appreciation"
                    >
                      <i className="fas fa-star"></i>
                    </button>

                    {/* Match Score */}
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: `${auraColor}20`,
                        color: auraColor
                      }}
                    >
                      {connection.matchScore}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {connections.length > 0 && (
        <div className="sticky bottom-0 bg-xr-dark/95 backdrop-blur-sm border-t border-xr-dim/20 p-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-white">{connections.length}</p>
              <p className="text-xr-dim text-xs">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-xr-accent">
                {connections.length > 0 
                  ? Math.round(connections.reduce((sum, c) => sum + c.matchScore, 0) / connections.length)
                  : 0}%
              </p>
              <p className="text-xr-dim text-xs">Avg Match</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {connections.reduce((sum, c) => sum + c.appreciationCount, 0)}
              </p>
              <p className="text-xr-dim text-xs">Stars Sent</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
