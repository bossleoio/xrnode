export interface Profile {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  interests: string[];
  imageUrl: string;
  matchPercentage: number;
}

export enum AppState {
  LANDING = 'LANDING',
  SCANNING = 'SCANNING',
  PROFILE_VIEW = 'PROFILE_VIEW',
  MATCHED = 'MATCHED'
}
