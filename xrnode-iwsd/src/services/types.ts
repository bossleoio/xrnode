/**
 * XR NODE Matchmaking Types
 * Core type definitions for the matchmaking application
 */

export interface Profile {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  interests: string[];
  skills: string[];
  imageUrl: string;
  linkedInUrl?: string;
  location?: string;
  experienceYears?: number;
}

export interface Connection {
  id: string;
  profile: Profile;
  matchScore: number;
  connectedAt: Date;
  appreciationCount: number;
}

export enum MatchLevel {
  EXCELLENT = 'EXCELLENT',  // 75-100%
  GOOD = 'GOOD',            // 50-74%
  POTENTIAL = 'POTENTIAL'   // 0-49%
}

export interface MatchResult {
  score: number;
  matchLevel: MatchLevel;
  reasons: string[];
}

export interface ScanResult {
  participantId: string;
  rawData: string;
  timestamp: Date;
}

export enum AppState {
  LANDING = 'LANDING',
  SCANNING = 'SCANNING',
  PROFILE_VIEW = 'PROFILE_VIEW',
  HANDSHAKE = 'HANDSHAKE',
  DIRECTORY = 'DIRECTORY',
  NETWORK = 'NETWORK',
  ERROR = 'ERROR'
}
