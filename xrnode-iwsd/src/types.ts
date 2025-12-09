export interface Profile {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  interests: string[];
  skills: string[];
  imageUrl: string;
  matchPercentage: number;
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

export interface MatchResult {
  score: number;
  matchLevel: MatchLevel;
  reasons: string[];
}

export enum MatchLevel {
  EXCELLENT = 'EXCELLENT',  // 75-100% - Green
  GOOD = 'GOOD',            // 50-74% - Yellow
  LOW = 'LOW'               // 0-49% - Red
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

export interface AppError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface ScanResult {
  participantId: string;
  timestamp: Date;
  raw: string;
}

export interface UserProfile extends Profile {
  connections: Connection[];
}
