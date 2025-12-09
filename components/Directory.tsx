import React, { useState, useEffect, useMemo } from 'react';
import { Profile, MatchResult, MatchLevel } from '../types';
import { getAllParticipants, searchParticipants } from '../services/profileService';
import { analyzeMatch, getAuraColor, getMatchLevel } from '../services/matchingService';
import { MATCH_THRESHOLDS } from '../constants';

interface DirectoryProps {
  currentUser: Profile;
  onSelectProfile: (profile: Profile, matchResult: MatchResult) => void;
  onClose: () => void;
}

type FilterType = 'all' | 'excellent' | 'good' | 'low';
type SortType = 'match' | 'name' | 'company';

const Directory: React.FC<DirectoryProps> = ({ currentUser, onSelectProfile, onClose }) => {
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [matchResults, setMatchResults] = useState<Map<string, MatchResult>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('match');
  const [isLoading, setIsLoading] = useState(true);

  // Load participants and calculate matches
  useEffect(() => {
    const loadParticipants = async () => {
      setIsLoading(true);
      try {
        const allParticipants = await getAllParticipants();
        // Filter out current user
        const others = allParticipants.filter(p => p.id !== currentUser.id);
        setParticipants(others);

        // Calculate match scores for all participants
        const matches = new Map<string, MatchResult>();
        for (const participant of others) {
          const result = await analyzeMatch(currentUser, participant);
          matches.set(participant.id, result);
        }
        setMatchResults(matches);
      } catch (error) {
        console.error('Failed to load participants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();
  }, [currentUser]);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        const allParticipants = await getAllParticipants();
        setParticipants(allParticipants.filter(p => p.id !== currentUser.id));
        return;
      }

      const results = await searchParticipants(searchQuery);
      setParticipants(results.filter(p => p.id !== currentUser.id));
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUser.id]);

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(p => {
        const match = matchResults.get(p.id);
        if (!match) return false;
        
        switch (filter) {
          case 'excellent':
            return match.matchLevel === MatchLevel.EXCELLENT;
          case 'good':
            return match.matchLevel === MatchLevel.GOOD;
          case 'low':
            return match.matchLevel === MatchLevel.LOW;
          default:
            return true;
        }
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'match':
          const matchA = matchResults.get(a.id)?.score || 0;
          const matchB = matchResults.get(b.id)?.score || 0;
          return matchB - matchA;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    return filtered;
  }, [participants, matchResults, filter, sort]);

  const handleProfileClick = (profile: Profile) => {
    const matchResult = matchResults.get(profile.id);
    if (matchResult) {
      onSelectProfile(profile, matchResult);
    }
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
          <h1 className="text-lg font-bold text-white">All Participants</h1>
          <div className="w-8"></div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-xr-dim"></i>
            <input
              type="text"
              placeholder="Search by name, skill, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-xr-panel border border-xr-dim/30 rounded-lg text-white placeholder-xr-dim focus:outline-none focus:border-xr-accent/50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
            label="All"
          />
          <FilterButton 
            active={filter === 'excellent'} 
            onClick={() => setFilter('excellent')}
            label="Excellent"
            color="#22c55e"
          />
          <FilterButton 
            active={filter === 'good'} 
            onClick={() => setFilter('good')}
            label="Good"
            color="#eab308"
          />
          <FilterButton 
            active={filter === 'low'} 
            onClick={() => setFilter('low')}
            label="Potential"
            color="#ef4444"
          />
        </div>

        {/* Sort */}
        <div className="px-4 pb-3 flex items-center gap-2 text-sm">
          <span className="text-xr-dim">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="bg-xr-panel border border-xr-dim/30 rounded px-2 py-1 text-white focus:outline-none focus:border-xr-accent/50"
          >
            <option value="match">Match Score</option>
            <option value="name">Name</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-xr-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xr-dim">Loading participants...</p>
            </div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-users text-4xl text-xr-dim mb-3"></i>
              <p className="text-xr-dim">No participants found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredParticipants.map(participant => {
              const matchResult = matchResults.get(participant.id);
              const auraColor = matchResult ? getAuraColor(matchResult.matchLevel) : '#6b7280';
              
              return (
                <button
                  key={participant.id}
                  onClick={() => handleProfileClick(participant)}
                  className="w-full bg-xr-panel rounded-xl p-4 flex items-center gap-4 hover:bg-xr-panel/80 transition-colors text-left"
                  style={{ borderLeft: `4px solid ${auraColor}` }}
                >
                  {/* Avatar */}
                  <div 
                    className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                    style={{ boxShadow: `0 0 15px ${auraColor}30` }}
                  >
                    <img 
                      src={participant.imageUrl} 
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{participant.name}</h3>
                    <p className="text-xr-accent text-sm truncate">{participant.role}</p>
                    <p className="text-xr-dim text-xs truncate">{participant.company}</p>
                  </div>

                  {/* Match Score */}
                  {matchResult && (
                    <div 
                      className="flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: `${auraColor}20`,
                        color: auraColor
                      }}
                    >
                      {matchResult.score}%
                    </div>
                  )}

                  <i className="fas fa-chevron-right text-xr-dim"></i>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="sticky bottom-0 bg-xr-dark/95 backdrop-blur-sm border-t border-xr-dim/20 p-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-white">{participants.length}</p>
            <p className="text-xr-dim text-xs">Participants</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {[...matchResults.values()].filter(m => m.matchLevel === MatchLevel.EXCELLENT).length}
            </p>
            <p className="text-xr-dim text-xs">Excellent Matches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">
              {[...matchResults.values()].filter(m => m.matchLevel === MatchLevel.GOOD).length}
            </p>
            <p className="text-xr-dim text-xs">Good Matches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter button component
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label, color }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
      active 
        ? 'bg-xr-accent text-black' 
        : 'bg-xr-panel text-xr-dim hover:text-white'
    }`}
    style={active && color ? { backgroundColor: color } : undefined}
  >
    {color && !active && (
      <span 
        className="inline-block w-2 h-2 rounded-full mr-2"
        style={{ backgroundColor: color }}
      ></span>
    )}
    {label}
  </button>
);

export default Directory;
