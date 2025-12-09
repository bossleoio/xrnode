import React from 'react';
import { Profile, MatchResult, MatchLevel } from '../types';
import { getAuraColor, getMatchLevelLabel } from '../services/matchingService';
import { isConnected } from '../services/connectionService';

interface ProfileCardProps {
  profile: Profile;
  matchResult: MatchResult;
  onConnect: () => void;
  onPass: () => void;
  onClose: () => void;
  onSendAppreciation?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  matchResult,
  onConnect,
  onPass,
  onClose,
  onSendAppreciation
}) => {
  const auraColor = getAuraColor(matchResult.matchLevel);
  const matchLabel = getMatchLevelLabel(matchResult.matchLevel);
  const alreadyConnected = isConnected(profile.id);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      {/* Aura glow effect */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${auraColor}40 0%, transparent 70%)`
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-xr-dim hover:text-white transition-colors z-10"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Profile Card */}
        <div 
          className="bg-xr-panel rounded-2xl overflow-hidden shadow-2xl"
          style={{ 
            boxShadow: `0 0 60px ${auraColor}40, 0 0 100px ${auraColor}20`
          }}
        >
          {/* Profile Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-xr-panel via-transparent to-transparent" />
            
            {/* Match Score Badge */}
            <div 
              className="absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-white flex items-center gap-2"
              style={{ backgroundColor: auraColor }}
            >
              <i className="fas fa-bolt"></i>
              {matchResult.score}% Match
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            {/* Name and Role */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-xr-accent">{profile.role}</p>
              <p className="text-xr-dim text-sm">{profile.company}</p>
            </div>

            {/* Match Level Indicator */}
            <div 
              className="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: `${auraColor}20` }}
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: auraColor }}
              />
              <span className="text-white font-medium">{matchLabel}</span>
            </div>

            {/* Match Reasons */}
            {matchResult.reasons.length > 0 && (
              <div className="mb-4">
                <p className="text-xr-dim text-xs uppercase tracking-wide mb-2">Why you match</p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.reasons.map((reason, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-xr-dark rounded-full text-sm text-xr-text"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            <p className="text-xr-text text-sm mb-4 leading-relaxed">{profile.bio}</p>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-xr-dim text-xs uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 4).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-xr-accent/20 text-xr-accent rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <p className="text-xr-dim text-xs uppercase tracking-wide mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-xr-secondary/20 text-xr-secondary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Location & Experience */}
            <div className="flex items-center gap-4 text-xr-dim text-sm mb-6">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-map-marker-alt"></i>
                  {profile.location}
                </span>
              )}
              {profile.experienceYears && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-briefcase"></i>
                  {profile.experienceYears} years
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {alreadyConnected ? (
                <>
                  <button
                    onClick={onSendAppreciation}
                    className="flex-1 py-3 px-6 bg-xr-secondary text-white font-medium rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-star"></i>
                    Send Star
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-6 bg-xr-panel border border-xr-dim/30 text-white font-medium rounded-xl hover:border-xr-accent/50 transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onPass}
                    className="flex-1 py-3 px-6 bg-xr-panel border border-xr-dim/30 text-xr-dim font-medium rounded-xl hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-times"></i>
                    Pass
                  </button>
                  <button
                    onClick={onConnect}
                    className="flex-1 py-3 px-6 text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                    style={{ backgroundColor: auraColor }}
                  >
                    <i className="fas fa-handshake"></i>
                    Connect
                  </button>
                </>
              )}
            </div>

            {/* LinkedIn Link */}
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-xr-dim hover:text-xr-accent transition-colors text-sm"
              >
                <i className="fab fa-linkedin"></i>
                View LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
