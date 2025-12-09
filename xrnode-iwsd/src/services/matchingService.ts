import { Profile, MatchResult, MatchLevel } from '../types';
import { MATCH_THRESHOLDS } from '../constants';

/**
 * AI-powered matching analysis between two profiles
 * Analyzes skill alignment, domain match, experience level, and interests
 */
export async function analyzeMatch(
  currentUser: Profile,
  scannedProfile: Profile
): Promise<MatchResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let score = 0;
  const reasons: string[] = [];
  
  // 1. Skill alignment (up to 30 points)
  const skillOverlap = calculateSkillOverlap(currentUser.skills, scannedProfile.skills);
  const skillScore = Math.min(skillOverlap * 10, 30);
  score += skillScore;
  if (skillOverlap > 0) {
    reasons.push(`${skillOverlap} shared skill${skillOverlap > 1 ? 's' : ''}`);
  }
  
  // 2. Interest alignment (up to 25 points)
  const interestOverlap = calculateInterestOverlap(currentUser.interests, scannedProfile.interests);
  const interestScore = Math.min(interestOverlap * 8, 25);
  score += interestScore;
  if (interestOverlap > 0) {
    reasons.push(`${interestOverlap} shared interest${interestOverlap > 1 ? 's' : ''}`);
  }
  
  // 3. Role complementarity (up to 20 points)
  const roleScore = calculateRoleComplementarity(currentUser.role, scannedProfile.role);
  score += roleScore;
  if (roleScore >= 15) {
    reasons.push('Complementary roles');
  }
  
  // 4. Experience level compatibility (up to 15 points)
  const expScore = calculateExperienceCompatibility(
    currentUser.experienceYears || 0,
    scannedProfile.experienceYears || 0
  );
  score += expScore;
  if (expScore >= 10) {
    reasons.push('Compatible experience levels');
  }
  
  // 5. Location bonus (up to 10 points)
  if (currentUser.location && scannedProfile.location) {
    const locationScore = calculateLocationBonus(currentUser.location, scannedProfile.location);
    score += locationScore;
    if (locationScore >= 5) {
      reasons.push('Same region');
    }
  }
  
  // Ensure score is within bounds
  score = Math.min(Math.max(Math.round(score), 0), 100);
  
  // Determine match level
  const matchLevel = getMatchLevel(score);
  
  return {
    score,
    matchLevel,
    reasons
  };
}

/**
 * Calculate skill overlap between two profiles
 */
function calculateSkillOverlap(skills1: string[], skills2: string[]): number {
  const normalizedSkills1 = skills1.map(s => s.toLowerCase());
  const normalizedSkills2 = skills2.map(s => s.toLowerCase());
  
  return normalizedSkills1.filter(s => 
    normalizedSkills2.some(s2 => s2.includes(s) || s.includes(s2))
  ).length;
}

/**
 * Calculate interest overlap between two profiles
 */
function calculateInterestOverlap(interests1: string[], interests2: string[]): number {
  const normalizedInterests1 = interests1.map(i => i.toLowerCase());
  const normalizedInterests2 = interests2.map(i => i.toLowerCase());
  
  return normalizedInterests1.filter(i => 
    normalizedInterests2.some(i2 => {
      const words1 = i.split(' ');
      const words2 = i2.split(' ');
      return words1.some(w1 => words2.some(w2 => w1 === w2 && w1.length > 3));
    })
  ).length;
}

/**
 * Calculate role complementarity score
 */
function calculateRoleComplementarity(role1: string, role2: string): number {
  const complementaryPairs: [string[], string[]][] = [
    [['developer', 'engineer'], ['designer', 'ux']],
    [['developer', 'engineer'], ['product', 'manager']],
    [['data', 'analyst'], ['developer', 'engineer']],
    [['ai', 'ml'], ['developer', 'engineer']],
    [['devops'], ['developer', 'engineer']],
    [['project', 'manager'], ['developer', 'engineer']],
  ];
  
  const r1 = role1.toLowerCase();
  const r2 = role2.toLowerCase();
  
  // Same role type - moderate compatibility
  if (r1.includes(r2) || r2.includes(r1)) {
    return 12;
  }
  
  // Check complementary pairs
  for (const [group1, group2] of complementaryPairs) {
    const r1InGroup1 = group1.some(k => r1.includes(k));
    const r1InGroup2 = group2.some(k => r1.includes(k));
    const r2InGroup1 = group1.some(k => r2.includes(k));
    const r2InGroup2 = group2.some(k => r2.includes(k));
    
    if ((r1InGroup1 && r2InGroup2) || (r1InGroup2 && r2InGroup1)) {
      return 20;
    }
  }
  
  return 5;
}

/**
 * Calculate experience level compatibility
 */
function calculateExperienceCompatibility(exp1: number, exp2: number): number {
  const diff = Math.abs(exp1 - exp2);
  
  if (diff <= 2) return 15;
  if (diff <= 4) return 10;
  if (diff <= 6) return 5;
  return 2;
}

/**
 * Calculate location bonus
 */
function calculateLocationBonus(loc1: string, loc2: string): number {
  // Same city
  if (loc1.toLowerCase() === loc2.toLowerCase()) {
    return 10;
  }
  
  // Same state/region
  const state1 = loc1.split(',').pop()?.trim().toLowerCase();
  const state2 = loc2.split(',').pop()?.trim().toLowerCase();
  
  if (state1 && state2 && state1 === state2) {
    return 7;
  }
  
  return 0;
}

/**
 * Determine match level based on score
 */
export function getMatchLevel(score: number): MatchLevel {
  if (score >= MATCH_THRESHOLDS.EXCELLENT) {
    return MatchLevel.EXCELLENT;
  } else if (score >= MATCH_THRESHOLDS.GOOD) {
    return MatchLevel.GOOD;
  }
  return MatchLevel.LOW;
}

/**
 * Get aura color based on match level
 */
export function getAuraColor(matchLevel: MatchLevel): string {
  switch (matchLevel) {
    case MatchLevel.EXCELLENT:
      return '#22c55e'; // Green
    case MatchLevel.GOOD:
      return '#eab308'; // Yellow
    case MatchLevel.LOW:
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get match level label
 */
export function getMatchLevelLabel(matchLevel: MatchLevel): string {
  switch (matchLevel) {
    case MatchLevel.EXCELLENT:
      return 'Excellent Match';
    case MatchLevel.GOOD:
      return 'Good Match';
    case MatchLevel.LOW:
      return 'Potential Match';
    default:
      return 'Unknown';
  }
}
