/**
 * XR NODE Constants
 * Application-wide constants and configuration
 */

import { Profile } from './types.js';

export const APP_NAME = "XR NODE";
export const EVENT_NAME = "Hackathon 2025";

// QR Code Configuration
export const QR_PREFIX = "XRNODE:";
export const SCAN_TIMEOUT = 30000; // 30 seconds

// Match Thresholds
export const MATCH_THRESHOLDS = {
  EXCELLENT: 75,
  GOOD: 50
};

// Aura Colors
export const AURA_COLORS = {
  EXCELLENT: '#22c55e', // Green
  GOOD: '#eab308',      // Yellow
  POTENTIAL: '#ef4444'  // Red
};

// Simulated Participant Database
export const PARTICIPANT_DATABASE: Profile[] = [
  {
    id: 'p001',
    name: 'Sabina Chen',
    role: 'Project Manager',
    company: 'Hired',
    bio: 'Navigating the intersection of economic trends and AR data visualization.',
    interests: ['Economic Indicators', 'Data Storytelling', 'AR Dashboards'],
    skills: ['Project Management', 'Agile', 'Data Analysis', 'Team Leadership'],
    imageUrl: 'https://picsum.photos/400/500?random=1',
    linkedInUrl: 'https://linkedin.com/in/sabinachen',
    location: 'San Francisco, CA',
    experienceYears: 8
  },
  {
    id: 'p002',
    name: 'Vong Patel',
    role: 'Data Strategist',
    company: 'Minstar',
    bio: 'Looking for partners to build the next gen of coherent healthcare deliverables in VR.',
    interests: ['Healthcare Data', 'Virtual Collaboration', 'Clean Sets'],
    skills: ['Data Strategy', 'Healthcare IT', 'VR Development', 'Python'],
    imageUrl: 'https://picsum.photos/400/500?random=2',
    linkedInUrl: 'https://linkedin.com/in/vongpatel',
    location: 'Austin, TX',
    experienceYears: 6
  },
  {
    id: 'p003',
    name: 'Marlaina Rodriguez',
    role: 'XR Developer',
    company: 'Chamber of Commerce',
    bio: 'Focusing on member marketing through immersive city experiences.',
    interests: ['Spatial Audio', 'Digital Twins', 'Civic Tech'],
    skills: ['WebXR', 'Three.js', 'React', 'TypeScript', 'Unity'],
    imageUrl: 'https://picsum.photos/400/500?random=3',
    linkedInUrl: 'https://linkedin.com/in/marlainarodriguez',
    location: 'Denver, CO',
    experienceYears: 5
  },
  {
    id: 'p004',
    name: 'Alex Kim',
    role: 'AI Engineer',
    company: 'TechVentures',
    bio: 'Building intelligent systems that understand human behavior in virtual spaces.',
    interests: ['Machine Learning', 'Computer Vision', 'XR Analytics'],
    skills: ['Python', 'TensorFlow', 'Computer Vision', 'NLP'],
    imageUrl: 'https://picsum.photos/400/500?random=4',
    linkedInUrl: 'https://linkedin.com/in/alexkim',
    location: 'Seattle, WA',
    experienceYears: 4
  },
  {
    id: 'p005',
    name: 'Jordan Taylor',
    role: 'UX Designer',
    company: 'DesignLab',
    bio: 'Crafting intuitive spatial interfaces that feel natural and accessible.',
    interests: ['Spatial UI', 'Accessibility', 'User Research'],
    skills: ['Figma', 'Prototyping', 'User Research', 'Spatial Design'],
    imageUrl: 'https://picsum.photos/400/500?random=5',
    linkedInUrl: 'https://linkedin.com/in/jordantaylor',
    location: 'Portland, OR',
    experienceYears: 7
  },
  {
    id: 'p006',
    name: 'Deepak Sharma',
    role: 'Full Stack Developer',
    company: 'StartupXYZ',
    bio: 'Passionate about building scalable web applications with immersive features.',
    interests: ['WebXR', 'React', 'Node.js', 'Cloud Architecture'],
    skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'WebXR'],
    imageUrl: 'https://picsum.photos/400/500?random=6',
    linkedInUrl: 'https://linkedin.com/in/deepaksharma',
    location: 'New York, NY',
    experienceYears: 6
  },
  {
    id: 'p007',
    name: 'Serena Williams',
    role: 'AI Researcher',
    company: 'AI Labs',
    bio: 'Researching AI-powered matching algorithms for social connections.',
    interests: ['Recommendation Systems', 'Social Networks', 'NLP'],
    skills: ['Machine Learning', 'Python', 'Research', 'Data Science'],
    imageUrl: 'https://picsum.photos/400/500?random=7',
    linkedInUrl: 'https://linkedin.com/in/serenawilliams',
    location: 'Boston, MA',
    experienceYears: 5
  },
  {
    id: 'p008',
    name: 'Marcus Johnson',
    role: '3D Artist',
    company: 'Creative Studios',
    bio: 'Creating stunning 3D environments and characters for immersive experiences.',
    interests: ['3D Modeling', 'Animation', 'Virtual Production'],
    skills: ['Blender', 'Maya', 'Substance Painter', 'Unity'],
    imageUrl: 'https://picsum.photos/400/500?random=8',
    linkedInUrl: 'https://linkedin.com/in/marcusjohnson',
    location: 'Los Angeles, CA',
    experienceYears: 8
  }
];
