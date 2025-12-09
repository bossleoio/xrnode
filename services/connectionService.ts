import { Connection, Profile } from '../types';

const STORAGE_KEY = 'xrnode_connections';

/**
 * Connection Service
 * Manages user connections and persistence
 */

/**
 * Save a new connection after handshake confirmation
 */
export function saveConnection(profile: Profile, matchScore: number): Connection {
  const connection: Connection = {
    id: `conn_${Date.now()}_${profile.id}`,
    profile,
    matchScore,
    connectedAt: new Date(),
    appreciationCount: 0
  };
  
  const connections = getConnections();
  
  // Check if already connected
  const existingIndex = connections.findIndex(c => c.profile.id === profile.id);
  if (existingIndex >= 0) {
    // Update existing connection
    connections[existingIndex] = {
      ...connections[existingIndex],
      matchScore,
      connectedAt: new Date()
    };
  } else {
    connections.push(connection);
  }
  
  persistConnections(connections);
  return connection;
}

/**
 * Get all saved connections
 */
export function getConnections(): Connection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Restore Date objects
    return parsed.map((c: any) => ({
      ...c,
      connectedAt: new Date(c.connectedAt)
    }));
  } catch {
    return [];
  }
}

/**
 * Check if already connected to a profile
 */
export function isConnected(profileId: string): boolean {
  const connections = getConnections();
  return connections.some(c => c.profile.id === profileId);
}

/**
 * Get connection by profile ID
 */
export function getConnectionByProfileId(profileId: string): Connection | null {
  const connections = getConnections();
  return connections.find(c => c.profile.id === profileId) || null;
}

/**
 * Remove a connection
 */
export function removeConnection(connectionId: string): void {
  const connections = getConnections();
  const filtered = connections.filter(c => c.id !== connectionId);
  persistConnections(filtered);
}

/**
 * Send appreciation to a connection
 */
export function sendAppreciation(profileId: string): Connection | null {
  const connections = getConnections();
  const index = connections.findIndex(c => c.profile.id === profileId);
  
  if (index >= 0) {
    connections[index].appreciationCount += 1;
    persistConnections(connections);
    return connections[index];
  }
  
  return null;
}

/**
 * Get total connection count
 */
export function getConnectionCount(): number {
  return getConnections().length;
}

/**
 * Get connections sorted by match score
 */
export function getConnectionsSortedByScore(): Connection[] {
  return getConnections().sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get connections sorted by date
 */
export function getConnectionsSortedByDate(): Connection[] {
  return getConnections().sort((a, b) => 
    b.connectedAt.getTime() - a.connectedAt.getTime()
  );
}

/**
 * Clear all connections (for testing/reset)
 */
export function clearAllConnections(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Persist connections to localStorage
 */
function persistConnections(connections: Connection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

/**
 * Export connections data (for future sync with backend)
 */
export function exportConnections(): string {
  const connections = getConnections();
  return JSON.stringify(connections, null, 2);
}
