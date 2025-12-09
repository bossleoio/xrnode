/**
 * Profile Service
 * Handles participant profile lookup from event database
 */

import { Profile } from './types.js';
import { PARTICIPANT_DATABASE, QR_PREFIX } from './constants.js';

/**
 * Get profile by participant ID
 */
export function getProfileById(participantId: string): Profile | null {
  const profile = PARTICIPANT_DATABASE.find(p => p.id === participantId);
  return profile || null;
}

/**
 * Parse QR code data to extract participant ID
 */
export function parseQRCode(qrData: string): string | null {
  if (!qrData) return null;
  
  // Check if QR code has the expected prefix
  if (qrData.startsWith(QR_PREFIX)) {
    return qrData.substring(QR_PREFIX.length);
  }
  
  // Try to parse as plain participant ID
  if (qrData.startsWith('p') && /^p\d{3}$/.test(qrData)) {
    return qrData;
  }
  
  return null;
}

/**
 * Get all participants
 */
export function getAllParticipants(): Profile[] {
  return [...PARTICIPANT_DATABASE];
}

/**
 * Search participants by name or skill
 */
export function searchParticipants(query: string): Profile[] {
  const lowerQuery = query.toLowerCase();
  return PARTICIPANT_DATABASE.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.skills.some(s => s.toLowerCase().includes(lowerQuery)) ||
    p.interests.some(i => i.toLowerCase().includes(lowerQuery)) ||
    p.role.toLowerCase().includes(lowerQuery) ||
    p.company.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Validate profile data
 */
export function validateProfile(profile: any): profile is Profile {
  return (
    typeof profile === 'object' &&
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.role === 'string' &&
    typeof profile.company === 'string' &&
    typeof profile.bio === 'string' &&
    Array.isArray(profile.interests) &&
    Array.isArray(profile.skills) &&
    typeof profile.imageUrl === 'string'
  );
}
