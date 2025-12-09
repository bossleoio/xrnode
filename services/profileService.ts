import { Profile } from '../types';
import { PARTICIPANT_DATABASE } from '../constants';

// Simulated API delay
const API_DELAY = 500;

/**
 * Fetch a participant profile by ID from the event database
 */
export async function getProfileById(participantId: string): Promise<Profile | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  
  const profile = PARTICIPANT_DATABASE.find(p => p.id === participantId);
  return profile || null;
}

/**
 * Get all participants from the event database
 */
export async function getAllParticipants(): Promise<Profile[]> {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  return [...PARTICIPANT_DATABASE];
}

/**
 * Search participants by name or skill
 */
export async function searchParticipants(query: string): Promise<Profile[]> {
  await new Promise(resolve => setTimeout(resolve, API_DELAY / 2));
  
  const lowerQuery = query.toLowerCase();
  return PARTICIPANT_DATABASE.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.role.toLowerCase().includes(lowerQuery) ||
    p.company.toLowerCase().includes(lowerQuery) ||
    p.skills.some(s => s.toLowerCase().includes(lowerQuery)) ||
    p.interests.some(i => i.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Validate profile data structure
 */
export function validateProfile(profile: unknown): profile is Profile {
  if (!profile || typeof profile !== 'object') return false;
  
  const p = profile as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.role === 'string' &&
    typeof p.company === 'string' &&
    typeof p.bio === 'string' &&
    Array.isArray(p.interests) &&
    Array.isArray(p.skills) &&
    typeof p.imageUrl === 'string'
  );
}
